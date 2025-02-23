import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CitySelector } from "../city-selector"

interface CityData {
  name: string
  country: string
  population: number
  latitude: number
  longitude: number
  is_capital: boolean
}

interface Step1Data {
  firstName: string
  birthLocation: CityData | null
}

interface Step1Props {
  data: Step1Data
  updateData: (data: Step1Data) => void
}

export default function Step1({ data, updateData }: Step1Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Partner 1</h2>
      <div className="space-y-2">
        <Label htmlFor="firstName1">First Name</Label>
        <Input
          id="firstName1"
          value={data.firstName}
          onChange={(e) => updateData({ ...data, firstName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthLocation1">Location of Birth</Label>
        <CitySelector
          value={data.birthLocation ? `${data.birthLocation.name}, ${data.birthLocation.country}${data.birthLocation.is_capital ? ' (Capital)' : ''}` : ""}
          onChange={(cityData) => updateData({ ...data, birthLocation: cityData })}
          placeholder="Select birth location..."
        />
      </div>
    </div>
  )
}

