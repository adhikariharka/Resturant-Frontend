"use client"

import { useState, useEffect } from "react"
import { Save, Plus, Trash2, Calendar, AlertTriangle, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  useGetHoursQuery,
  useUpdateHoursMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
  useGetTemporaryClosedStatusQuery,
  useUpdateTemporaryClosedStatusMutation,
} from "@/lib/store/api"
import { toast } from "sonner"

interface Holiday {
  id: string
  date: string
  name: string
  message: string
  createdAt: string
}

interface HourData {
  id: string
  day: string
  openTime: string
  closeTime: string
  isClosed: boolean
}

export function OpeningHoursContent() {
  const { data: hours = [], isLoading: hoursLoading } = useGetHoursQuery(undefined)
  const { data: holidays = [], isLoading: holidaysLoading } = useGetHolidaysQuery(undefined)
  const { data: settings, isLoading: settingsLoading } = useGetTemporaryClosedStatusQuery(undefined)
  const [updateHours, { isLoading: isSavingHours }] = useUpdateHoursMutation()
  const [createHoliday] = useCreateHolidayMutation()
  const [updateHoliday] = useUpdateHolidayMutation()
  const [deleteHoliday] = useDeleteHolidayMutation()
  const [updateTemporaryStatus, { isLoading: isUpdatingStatus }] = useUpdateTemporaryClosedStatusMutation()

  // Local state for editing hours
  const [editedHours, setEditedHours] = useState<HourData[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [holidayForm, setHolidayForm] = useState({
    date: "",
    name: "",
    message: "",
  })

  // Initialize edited hours when data loads
  useEffect(() => {
    if (hours.length > 0) {
      setEditedHours(hours.map((h: any) => ({ ...h })))
    }
  }, [hours])

  const handleHourChange = (index: number, field: keyof HourData, value: any) => {
    const newHours = [...editedHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setEditedHours(newHours)
    setHasChanges(true)
  }

  const handleSaveAllHours = async () => {
    try {
      // Update all hours that have changed
      const updates = editedHours.map((hour) =>
        updateHours({
          id: hour.id,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
        }).unwrap()
      )

      await Promise.all(updates)
      toast.success("Opening hours updated successfully")
      setHasChanges(false)
    } catch (error) {
      toast.error("Failed to update opening hours")
    }
  }

  const handleCancelChanges = () => {
    setEditedHours(hours.map((h: any) => ({ ...h })))
    setHasChanges(false)
    toast.info("Changes discarded")
  }

  const handleTemporaryStatusChange = async (isTemporaryClosed: boolean) => {
    try {
      await updateTemporaryStatus({ isTemporaryClosed }).unwrap()
      toast.success(isTemporaryClosed ? "Restaurant marked as temporarily closed" : "Restaurant reopened")
    } catch (error) {
      toast.error("Failed to update restaurant status")
    }
  }

  const handleSaveHoliday = async () => {
    if (!holidayForm.date || !holidayForm.name || !holidayForm.message) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      if (editingHoliday) {
        await updateHoliday({
          date: editingHoliday.date,
          name: holidayForm.name,
          message: holidayForm.message,
        }).unwrap()
        toast.success("Holiday updated")
      } else {
        await createHoliday(holidayForm).unwrap()
        toast.success("Holiday created")
      }
      setHolidayDialogOpen(false)
      setEditingHoliday(null)
      setHolidayForm({ date: "", name: "", message: "" })
    } catch (error) {
      toast.error(editingHoliday ? "Failed to update holiday" : "Failed to create holiday")
    }
  }

  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setHolidayForm({
      date: holiday.date,
      name: holiday.name,
      message: holiday.message,
    })
    setHolidayDialogOpen(true)
  }

  const handleDeleteHoliday = async (date: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return

    try {
      await deleteHoliday(date).unwrap()
      toast.success("Holiday deleted")
    } catch (error) {
      toast.error("Failed to delete holiday")
    }
  }

  const openNewHolidayDialog = () => {
    setEditingHoliday(null)
    setHolidayForm({ date: "", name: "", message: "" })
    setHolidayDialogOpen(true)
  }

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const sortedHours = [...editedHours].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
  const sortedHolidays = [...holidays].sort((a: Holiday, b: Holiday) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  if (hoursLoading || holidaysLoading || settingsLoading) {
    return <div>Loading...</div>
  }

  const isTemporaryClosed = settings?.isTemporaryClosed || false

  return (
    <div className="space-y-8">
      {/* Current status */}
      {/* <div className="bg-card border border-border rounded-xl p-6"> */}
      {/* <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">Restaurant Status</h2>
            <p className="text-sm text-muted-foreground">Temporarily close the restaurant for ordering</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{isTemporaryClosed ? "Closed" : "Open"}</span>
            <Switch
              checked={!isTemporaryClosed}
              onCheckedChange={(checked) => handleTemporaryStatusChange(!checked)}
              disabled={isUpdatingStatus}
            />
          </div>
        </div> */}

      {/* {isTemporaryClosed && (
          <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Restaurant is temporarily closed
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Customers will see "Temporarily Closed" message when trying to order.
                </p>
              </div>
            </div>
          </div>
        )} */}
      {/* </div> */}

      {/* Weekly hours */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">Weekly Hours</h2>
            <p className="text-sm text-muted-foreground">Set your regular opening hours for each day</p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleCancelChanges}>
                Cancel
              </Button>
            )}
            <Button
              className="gap-2"
              onClick={handleSaveAllHours}
              disabled={!hasChanges || isSavingHours}
            >
              <Save className="w-4 h-4" />
              {isSavingHours ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {hasChanges && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sortedHours.map((day, index) => {
            const originalIndex = editedHours.findIndex(h => h.id === day.id)
            return (
              <div key={day.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                <div className="w-28 flex-shrink-0">
                  <span className="font-medium text-foreground">{day.day}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={!day.isClosed}
                    onCheckedChange={(checked) => handleHourChange(originalIndex, 'isClosed', !checked)}
                  />
                  <span className="text-sm text-muted-foreground w-14">{day.isClosed ? "Closed" : "Open"}</span>
                </div>
                {!day.isClosed && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => handleHourChange(originalIndex, 'openTime', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => handleHourChange(originalIndex, 'closeTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Holidays */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">Holiday Closures</h2>
            <p className="text-sm text-muted-foreground">Schedule specific dates when the restaurant is closed</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={openNewHolidayDialog}>
            <Plus className="w-4 h-4" />
            Add Holiday
          </Button>
        </div>

        <div className="space-y-3">
          {sortedHolidays.length > 0 ? (
            sortedHolidays.map((holiday: Holiday) => (
              <div key={holiday.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{holiday.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(holiday.date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 italic">"{holiday.message}"</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleEditHoliday(holiday)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteHoliday(holiday.date)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No holidays scheduled</p>
          )}
        </div>
      </div>

      {/* Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHoliday ? "Edit Holiday" : "Add New Holiday"}</DialogTitle>
            <DialogDescription>
              {editingHoliday
                ? "Update the holiday details below."
                : "Create a new holiday closure with a custom message for customers."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-date">Date</Label>
              <Input
                id="holiday-date"
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                disabled={!!editingHoliday}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-name">Holiday Name</Label>
              <Input
                id="holiday-name"
                placeholder="e.g., Christmas Day, New Year"
                value={holidayForm.name}
                onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-message">Customer Message</Label>
              <Textarea
                id="holiday-message"
                placeholder="e.g., Closed for Christmas celebrations. We'll be back on December 26th!"
                value={holidayForm.message}
                onChange={(e) => setHolidayForm({ ...holidayForm, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHolidayDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveHoliday}>
              {editingHoliday ? "Update" : "Create"} Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
