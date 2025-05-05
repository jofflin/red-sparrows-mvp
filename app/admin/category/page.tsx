'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/utils/supabase/database.types'
import { Euro, Pencil, Plus, Trash2 } from "lucide-react"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createCategory, deleteCategory, updateCategory } from './actions'

type Category = Database["public"]["Tables"]["ticket_categories"]["Row"]

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        return
      }

      // Filter out any null values and ensure required fields are present
      const validCategories = (data || []).filter((cat): cat is Category =>
        cat.name !== null &&
        cat.description !== null &&
        cat.price !== null
      )

      setCategories(validCategories)
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !description || !price) {
      setError('Bitte fülle alle Felder aus')
      return
    }

    const priceNum = Number(price)
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setError('Bitte gib einen gültigen Preis ein')
      return
    }

    if (editingCategory) {
      await updateCategory({
        id: editingCategory.id,
        name,
        description,
        price: priceNum
      })
    } else {
      await createCategory({
        name,
        description,
        price: priceNum
      })
    }

    // Reset form
    setName('')
    setDescription('')
    setPrice('')
    setEditingCategory(null)

    // Refresh categories
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ticket_categories')
      .select('*')
      .order('name')

    if (!error && data) {
      const validCategories = data.filter((cat): cat is Category =>
        cat.name !== null &&
        cat.description !== null &&
        cat.price !== null
      )
      setCategories(validCategories)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description)
    setPrice(category.price.toString())
  }

  const handleDelete = async (id: number) => {
    if (confirm('Möchtest du diese Kategorie wirklich löschen?')) {
      await deleteCategory(id)

      // Refresh categories
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .order('name')

      if (!error && data) {
        const validCategories = data.filter((cat): cat is Category =>
          cat.name !== null &&
          cat.description !== null &&
          cat.price !== null
        )
        setCategories(validCategories)
      }
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Ticket Kategorien</h1>
            <Button asChild variant="outline">
              <Link href="/admin">
                Dashboard
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <Card className="flex-grow">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-lg">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-lg">Beschreibung</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="min-h-[100px] text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-lg">Preis (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="text-lg"
                      />
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {editingCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(null)
                          setName('')
                          setDescription('')
                          setPrice('')
                        }}
                      >
                        Abbrechen
                      </Button>
                    )}
                    <Button type="submit" size="lg" className="w-full text-lg">
                      {editingCategory ? 'Speichern' : 'Erstellen'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              <Card className="w-full lg:w-80 h-fit">
                <CardHeader>
                  <CardTitle className="text-xl">Hilfestellung</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Plus className="mr-2 h-5 w-5 text-secondary-500" />
                      <span>Erstelle neue Kategorien für verschiedene Tickettypen</span>
                    </li>
                    <li className="flex items-start">
                      <Pencil className="mr-2 h-5 w-5 text-secondary-500" />
                      <span>Bearbeite bestehende Kategorien</span>
                    </li>
                    <li className="flex items-start">
                      <Euro className="mr-2 h-5 w-5 text-secondary-500" />
                      <span>Setze den Preis für jede Kategorie</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bestehende Kategorien</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {category.name}
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{category.description}</p>
                      <p className="text-lg font-semibold mt-2">{category.price}€</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 