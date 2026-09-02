import { useParams, Navigate } from 'react-router-dom'
import DetailPageTemplate from '@/components/marketing/DetailPageTemplate'
import { INTEGRATIONS } from '@/data/marketingContent'

const IntegrationDetailPage = () => {
  const { slug } = useParams()
  const data = INTEGRATIONS[slug]
  if (!data) return <Navigate to="/" replace />
  return <DetailPageTemplate data={data} />
}

export default IntegrationDetailPage
