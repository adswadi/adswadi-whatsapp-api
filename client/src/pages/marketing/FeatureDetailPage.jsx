import { useParams, Navigate } from 'react-router-dom'
import DetailPageTemplate from '@/components/marketing/DetailPageTemplate'
import { FEATURES } from '@/data/marketingContent'

const FeatureDetailPage = () => {
  const { slug } = useParams()
  const data = FEATURES[slug]
  if (!data) return <Navigate to="/" replace />
  return <DetailPageTemplate data={data} />
}

export default FeatureDetailPage
