run-frontend:
	cd frontend && npm run dev

run-backend:
	uvicorn backend.main:app --reload