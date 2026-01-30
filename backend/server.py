from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import jwt
import shutil
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directories
UPLOAD_DIR = ROOT_DIR / "uploads"
IMAGES_DIR = UPLOAD_DIR / "images"
VIDEOS_DIR = UPLOAD_DIR / "videos"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'bklyn-garment-secret-2020')

# Stripe API Key
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')

# Get backend URL for generating file URLs
BACKEND_URL = os.environ.get('BACKEND_URL', '')

# Create the main app
app = FastAPI(title="The Bklyn Garment Gallery API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ============ MODELS ============

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str
    message: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str  # tees, hoodies, sweats, hats, accessories
    image_url: str
    sizes: List[str] = ["S", "M", "L", "XL", "XXL"]
    colors: List[str] = []
    featured: bool = False
    new_arrival: bool = False
    in_stock: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    sizes: List[str] = ["S", "M", "L", "XL", "XXL"]
    colors: List[str] = []
    featured: bool = False
    new_arrival: bool = False
    in_stock: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    featured: Optional[bool] = None
    new_arrival: Optional[bool] = None
    in_stock: Optional[bool] = None

class LookbookItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    image_url: str
    description: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LookbookCreate(BaseModel):
    title: str
    image_url: str
    description: str = ""

class Video(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    video_url: str
    description: str = ""
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VideoCreate(BaseModel):
    title: str
    video_url: str
    description: str = ""
    active: bool = True

# ============ ORDER & PAYMENT MODELS ============

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: str
    color: str = ""
    image_url: str = ""

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[OrderItem]
    total: float
    status: str = "pending"  # pending, paid, shipped, delivered, cancelled
    payment_status: str = "pending"  # pending, paid, failed
    session_id: str = ""
    customer_email: str = ""
    shipping_address: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    items: List[OrderItem]
    origin_url: str

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    order_id: str
    amount: float
    currency: str = "usd"
    status: str = "pending"
    payment_status: str = "pending"
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ AUTH HELPERS ============

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def create_token(username: str) -> str:
    payload = {
        "username": username,
        "exp": datetime.now(timezone.utc).timestamp() + 86400  # 24 hours
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ AUTH ROUTES ============

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(login: AdminLogin):
    if login.username == ADMIN_USERNAME and login.password == ADMIN_PASSWORD:
        token = create_token(login.username)
        return TokenResponse(token=token, message="Login successful")
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.get("/admin/verify")
async def verify_admin(payload: dict = Depends(verify_token)):
    return {"valid": True, "username": payload.get("username")}

# ============ PRODUCT ROUTES ============

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, featured: Optional[bool] = None, new_arrival: Optional[bool] = None):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if new_arrival is not None:
        query["new_arrival"] = new_arrival
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate, payload: dict = Depends(verify_token)):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: ProductUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, payload: dict = Depends(verify_token)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ============ LOOKBOOK ROUTES ============

@api_router.get("/lookbook", response_model=List[LookbookItem])
async def get_lookbook():
    items = await db.lookbook.find({}, {"_id": 0}).to_list(100)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.post("/lookbook", response_model=LookbookItem)
async def create_lookbook_item(item: LookbookCreate, payload: dict = Depends(verify_token)):
    lookbook_obj = LookbookItem(**item.model_dump())
    doc = lookbook_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.lookbook.insert_one(doc)
    return lookbook_obj

@api_router.delete("/lookbook/{item_id}")
async def delete_lookbook_item(item_id: str, payload: dict = Depends(verify_token)):
    result = await db.lookbook.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lookbook item not found")
    return {"message": "Lookbook item deleted successfully"}

# ============ CATEGORIES ============

@api_router.get("/categories")
async def get_categories():
    return {
        "categories": [
            {"id": "tees", "name": "Tees", "description": "Premium cotton tees"},
            {"id": "hoodies", "name": "Hoodies", "description": "Cozy streetwear hoodies"},
            {"id": "sweats", "name": "Sweats", "description": "Comfortable sweatpants"},
            {"id": "hats", "name": "Hats", "description": "Caps and beanies"},
            {"id": "accessories", "name": "Accessories", "description": "Bags, jewelry & more"}
        ]
    }

# ============ VIDEO ROUTES ============

@api_router.get("/videos", response_model=List[Video])
async def get_videos(active_only: bool = True):
    query = {"active": True} if active_only else {}
    videos = await db.videos.find(query, {"_id": 0}).to_list(100)
    for video in videos:
        if isinstance(video.get('created_at'), str):
            video['created_at'] = datetime.fromisoformat(video['created_at'])
    return videos

@api_router.post("/videos", response_model=Video)
async def create_video(video: VideoCreate, payload: dict = Depends(verify_token)):
    video_obj = Video(**video.model_dump())
    doc = video_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.videos.insert_one(doc)
    return video_obj

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, payload: dict = Depends(verify_token)):
    result = await db.videos.delete_one({"id": video_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"message": "Video deleted successfully"}

# ============ STRIPE PAYMENT ROUTES ============

@api_router.post("/checkout")
async def create_checkout(checkout_req: CheckoutRequest, request: Request):
    """Create a Stripe checkout session for cart items"""
    if not checkout_req.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total from server-side product prices (security)
    total = 0.0
    verified_items = []
    
    for item in checkout_req.items:
        # Get product from database to verify price
        product = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if product:
            item_total = float(product['price']) * item.quantity
            total += item_total
            verified_items.append({
                **item.model_dump(),
                "price": float(product['price'])  # Use server-side price
            })
        else:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
    
    # Create order in database
    order_id = str(uuid.uuid4())
    order = {
        "id": order_id,
        "items": verified_items,
        "total": total,
        "status": "pending",
        "payment_status": "pending",
        "session_id": "",
        "customer_email": "",
        "shipping_address": {},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order)
    
    # Build URLs
    success_url = f"{checkout_req.origin_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/cart"
    
    # Create Stripe checkout session
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_request = CheckoutSessionRequest(
        amount=total,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "order_id": order_id,
            "source": "bklyn_garment_gallery"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Update order with session ID
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"session_id": session.session_id}}
    )
    
    # Create payment transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "order_id": order_id,
        "amount": total,
        "currency": "usd",
        "status": "pending",
        "payment_status": "pending",
        "metadata": {"order_id": order_id},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"checkout_url": session.url, "session_id": session.session_id, "order_id": order_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    """Get the status of a checkout session"""
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update order and transaction if payment is complete
    if status.payment_status == "paid":
        # Check if already processed
        existing = await db.payment_transactions.find_one({
            "session_id": session_id,
            "payment_status": "paid"
        })
        
        if not existing:
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "complete", "payment_status": "paid"}}
            )
            
            # Update order
            await db.orders.update_one(
                {"session_id": session_id},
                {"$set": {"status": "paid", "payment_status": "paid"}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            # Update transaction and order
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "complete", "payment_status": "paid"}}
            )
            
            await db.orders.update_one(
                {"session_id": session_id},
                {"$set": {"status": "paid", "payment_status": "paid"}}
            )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ============ ORDER ROUTES ============

@api_router.get("/orders")
async def get_orders(payload: dict = Depends(verify_token)):
    """Get all orders (admin only)"""
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """Get a specific order"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, payload: dict = Depends(verify_token)):
    """Update order status (admin only)"""
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "The Bklyn Garment Gallery API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "bklyn-garment-gallery"}

# ============ FILE UPLOAD ENDPOINTS ============

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = IMAGES_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL path
    file_url = f"/api/uploads/images/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}

@api_router.post("/upload/video")
async def upload_video(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: MP4, MOV, AVI, WebM")
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "mp4"
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = VIDEOS_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL path
    file_url = f"/api/uploads/videos/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}

# Include router and middleware
app.include_router(api_router)

# Mount uploads AFTER router to avoid conflicts
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
