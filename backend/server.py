from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'bklyn-garment-secret-2020')

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

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "The Bklyn Garment Gallery API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "bklyn-garment-gallery"}

# Include router and middleware
app.include_router(api_router)

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
