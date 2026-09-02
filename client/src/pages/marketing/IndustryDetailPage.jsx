import { useParams, Navigate } from 'react-router-dom'
import DetailPageTemplate from '@/components/marketing/DetailPageTemplate'
import { INDUSTRIES } from '@/data/marketingContent'

const IndustryDetailPage = () => {
  const { slug } = useParams()
  const data = INDUSTRIES[slug]
  if (!data) return <Navigate to="/" replace />
  return <DetailPageTemplate data={data} />
}

export default IndustryDetailPage
