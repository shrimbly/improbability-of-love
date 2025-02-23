"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CityData {
  name: string
  country: string
  population: number
  latitude: number
  longitude: number
  is_capital: boolean
}

interface CitySelectorProps {
  value: string
  onChange: (city: CityData) => void
  placeholder?: string
}

export function CitySelector({ value, onChange, placeholder = "Select a city..." }: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [cities, setCities] = useState<CityData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const fetchCities = useCallback(async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Reset states if query is too short
    if (!query || query.length < 2) {
      setCities([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // Clean and format the query
      const formattedQuery = query
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters except hyphen
        .split(/\s+/)[0] // Take first word only

      if (!formattedQuery) {
        setCities([])
        setIsLoading(false)
        return
      }

      const response = await fetch(
        `https://api.api-ninjas.com/v1/city?name=${encodeURIComponent(formattedQuery)}`,
        {
          method: 'GET',
          headers: {
            'X-Api-Key': process.env.NEXT_PUBLIC_API_NINJAS_KEY || '',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid API response format')
      }

      // Transform and validate the API response
      const transformedData: CityData[] = data
        .filter(city => city && typeof city === 'object' && city.name && city.country)
        .map(city => ({
          name: city.name,
          country: city.country,
          population: typeof city.population === 'number' ? city.population : 1000000,
          latitude: typeof city.latitude === 'number' ? city.latitude : 0,
          longitude: typeof city.longitude === 'number' ? city.longitude : 0,
          is_capital: Boolean(city.is_capital)
        }))
        .slice(0, 10) // Limit to 10 results

      if (!controller.signal.aborted) {
        setCities(transformedData)
        setError(null)
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error('Error fetching cities:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch cities')
        setCities([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  // Debounce search with a longer delay
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedValue = inputValue.trim()
      if (trimmedValue !== '') {
        fetchCities(trimmedValue)
      } else {
        setCities([])
        setError(null)
      }
    }, 750) // Increased debounce time to prevent too many API calls

    return () => {
      clearTimeout(timeoutId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [inputValue, fetchCities])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search for a city..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : inputValue.length < 2 ? (
                <p className="text-sm text-muted-foreground">Type at least 2 characters to search...</p>
              ) : (
                <p className="text-sm text-muted-foreground">No cities found.</p>
              )}
            </CommandEmpty>
            {isLoading && (
              <CommandGroup>
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching cities...
                </div>
              </CommandGroup>
            )}
            {!isLoading && cities.length > 0 && (
              <CommandGroup heading="Cities">
                {cities.map((city) => (
                  <CommandItem
                    key={`${city.name}-${city.latitude}-${city.longitude}`}
                    value={`${city.name}, ${city.country}${city.is_capital ? ' (Capital)' : ''}`}
                    onSelect={() => {
                      onChange(city)
                      setInputValue("")
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === `${city.name}, ${city.country}${city.is_capital ? ' (Capital)' : ''}` ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {city.name}, {city.country}{city.is_capital ? ' (Capital)' : ''}
                    <span className="ml-2 text-xs text-muted-foreground">
                      Pop: {city.population.toLocaleString()}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 