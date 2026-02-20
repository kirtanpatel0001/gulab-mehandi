export type UserRole = 'admin' | 'customer'

export interface Profile {
  id: string
  full_name: string
  phone: string
  role: UserRole
  created_at: string
}

export interface Product {
  id: string
  name: string
  price: number
  image_url: string
  category: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'delivered'
  total: number
  created_at: string
}

export interface Appointment {
  id: string
  user_id: string
  service: string
  date: string
  status: 'pending' | 'confirmed' | 'cancelled'
}