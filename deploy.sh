#!/bin/bash

# --- ⚙️ CONFIGURATION (ตั้งค่าส่วนนี้) ---
PROJECT_ID="projectprt"
REGION="asia-southeast1"
SERVICE_NAME="frontend-app"
REPO_NAME="frontend-repo" # แยก Repo สำหรับ Frontend เพื่อความเป็นระเบียบ

# ⚠️ [สำคัญ] ใส่ URL ของ Backend ที่ Deploy เสร็จแล้ว (ดูได้จาก Cloud Run Backend)
BACKEND_API_URL="https://backend-api-886029565568.asia-southeast1.run.app"

# ⚠️ [สำคัญ] ใส่ Gemini API Key ของคุณที่นี่
GEMINI_API_KEY="NO_KEY_YET"

# ----------------------------------------
IMAGE_URL="asia-southeast1-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME"

echo "========================================================"
echo "🚀 Starting Frontend Deployment"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo "   Backend: $BACKEND_API_URL"
echo "========================================================"

# 1. สร้างไฟล์ .env.production อัตโนมัติ (เพื่อให้ Vite อ่านค่าตอน Build Docker)
echo "📝 Generating .env.production..."
cat > .env.production <<EOF
VITE_API_URL=$BACKEND_API_URL
VITE_GEMINI_API_KEY=$GEMINI_API_KEY
EOF
echo "   ✅ .env.production created with correct API URL."

# 2. เปิด API ที่จำเป็น (ป้องกัน Error กรณีเพิ่งสร้างโปรเจกต์ใหม่)
echo "🔧 Enabling necessary services..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com --project $PROJECT_ID

# 3. ตรวจสอบ/สร้าง Artifact Registry สำหรับ Frontend
echo "📦 Checking Artifact Registry Repository..."
if ! gcloud artifacts repositories describe $REPO_NAME --project=$PROJECT_ID --location=$REGION > /dev/null 2>&1; then
    echo "   Creating repository '$REPO_NAME'..."
    gcloud artifacts repositories create $REPO_NAME \
        --project=$PROJECT_ID \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for Frontend"
else
    echo "   Repository '$REPO_NAME' already exists."
fi

# 4. Build Container Image (Cloud Build)
# ขั้นตอนนี้จะ Copy ไฟล์ .env.production ที่เราเพิ่งสร้างเข้าไปใน Image ด้วย
echo "🏗️  Building Container Image..."
gcloud builds submit --tag $IMAGE_URL . --project $PROJECT_ID

# 5. Deploy ไปยัง Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URL \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080

echo "========================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 Frontend URL: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
echo "========================================================"