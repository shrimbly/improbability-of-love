import { Label } from "@/components/ui/label"
import { CitySelector } from "../city-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CityData {
  name: string
  country: string
  population: number
  latitude: number
  longitude: number
  is_capital: boolean
}

interface Step3Data {
  location: CityData | null
  howMet: string
}

interface Step3Props {
  data: Step3Data
  updateData: (data: Step3Data) => void
}

const meetingMethods = [
  { value: "friends", label: "Through Friends" },
  { value: "online", label: "Online Dating" },
  { value: "work", label: "At Work" },
  { value: "school", label: "At School" },
  { value: "hobbies", label: "Through Hobbies" },
  { value: "other", label: "Other" },
]

export default function Step3({ data, updateData }: Step3Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Meeting Details</h2>
      <div className="space-y-2">
        <Label htmlFor="location">Where did you meet?</Label>
        <CitySelector
          value={data.location ? `${data.location.name}, ${data.location.country}${data.location.is_capital ? ' (Capital)' : ''}` : ""}
          onChange={(cityData) => updateData({ ...data, location: cityData })}
          placeholder="Select meeting location..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="howMet">How did you meet?</Label>
        <Select value={data.howMet} onValueChange={(value) => updateData({ ...data, howMet: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select how you met..." />
          </SelectTrigger>
          <SelectContent>
            {meetingMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

