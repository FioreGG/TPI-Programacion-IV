export interface UsuarioAuth {
  id: number
  username: string
  full_name: string
  email: string
  role: 'admin' | 'user'
  disabled: boolean
  created_at: string
}

export interface UsuarioRegistro {
  username: string
  full_name: string
  email: string
  password: string
}

export type UsuarioAdmin = UsuarioAuth
