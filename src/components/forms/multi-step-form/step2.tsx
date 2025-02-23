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

interface Step2Data {
  firstName: string
  birthLocation: CityData | null
}

interface Step2Props {
  data: Step2Data
  updateData: (data: Step2Data) => void
}

export default function Step2({ data, updateData }: Step2Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Partner 2</h2>
      <div className="space-y-2">
        <Label htmlFor="firstName2">First Name</Label>
        <Input
          id="firstName2"
          value={data.firstName}
          onChange={(e) => updateData({ ...data, firstName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthLocation2">Location of Birth</Label>
        <CitySelector
          value={data.birthLocation ? `${data.birthLocation.name}, ${data.birthLocation.country}${data.birthLocation.is_capital ? ' (Capital)' : ''}` : ""}
          onChange={(cityData) => updateData({ ...data, birthLocation: cityData })}
          placeholder="Select birth location..."
        />
      </div>
    </div>
  )
}

