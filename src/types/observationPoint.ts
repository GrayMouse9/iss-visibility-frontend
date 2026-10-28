export interface ObservationPoint {
  id: number
  name: string
  description: string
  image_url: string
  video_url: string
  latitude: number | null
  longitude: number | null
  likes: number
}
