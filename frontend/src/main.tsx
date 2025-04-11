import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ }: { error: Error }) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="text-red-500 w-12 h-12" />
          <h1 className="text-3xl font-bold text-gray-800">404 - 페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            요청하신 페이지가 존재하지 않거나, 이동되었을 수 있어요.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="mt-4"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <StrictMode>
      <App />
    </StrictMode>
  </ErrorBoundary>
)
