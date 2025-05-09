'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCategory({
  name,
  description,
  price
}: {
  name: string
  description: string
  price: number
}) {
  const supabase = createClient()

  const { error } = await supabase.from('ticket_categories').insert({
    name,
    description,
    price
  })

  if (error) {
    console.error('Error creating category:', error)
    redirect('/error')
  }

  revalidatePath('/admin/category', 'page')
  redirect('/admin/category')
}

export async function updateCategory({
  id,
  name,
  description,
  price
}: {
  id: number
  name: string
  description: string
  price: number
}) {
  const supabase = createClient()

  const { error } = await supabase.from('ticket_categories')
    .update({
      name,
      description,
      price
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    redirect('/error')
  }

  revalidatePath('/admin/category', 'page')
  redirect('/admin/category')
}

export async function deleteCategory(id: number) {
  const supabase = createClient()

  const { error } = await supabase.from('ticket_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    redirect('/error')
  }

  revalidatePath('/admin/category', 'page')
  redirect('/admin/category')
} 