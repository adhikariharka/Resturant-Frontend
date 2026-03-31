"use client"

import { useState } from "react"
import { User, MapPin, Package, LogOut, Pencil, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  useGetAddressesQuery,
  useUpdateUserMutation,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useWhoamiQuery,
  // Orders removed from here
} from "@/lib/store/api"

export function AccountContent() {
  const { data: session, status, update: updateSession } = useSession()
  const { data: userData, isLoading: isUserLoading } = useWhoamiQuery(undefined, { skip: !session })
  const user = userData
  const router = useRouter()

  const { data: addresses = [], isLoading: isAddressesLoading } = useGetAddressesQuery(user?.id ?? "", {
    skip: !user?.id
  })


  // Orders
  // Orders removed

  // Mutations
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation()
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateAddressMutation()
  const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation()
  const [deleteAddress, { isLoading: isDeletingAddress }] = useDeleteAddressMutation()

  // State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState("")

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null) // Address object or null
  const [addressForm, setAddressForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    isDefault: false
  })

  // Handlers
  // Handlers

  const handleEditProfile = () => {
    setProfileName(user?.name || "")
    setIsEditingProfile(true)
  }

  const handleSaveProfile = async () => {
    try {
      await updateUser({ id: user.id, name: profileName }).unwrap()
      await updateSession({ ...session, user: { ...user, name: profileName } }) // Refresh session
      router.refresh()
      setIsEditingProfile(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleOpenAddressDialog = (address?: any) => {
    if (address) {
      setEditingAddress(address)
      setAddressForm({
        label: address.label,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        postcode: address.postcode,
        isDefault: address.isDefault
      })
    } else {
      setEditingAddress(null)
      setAddressForm({
        label: "",
        line1: "",
        line2: "",
        city: "",
        postcode: "",
        isDefault: false
      })
    }
    setIsAddressDialogOpen(true)
  }

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        await updateAddress({ id: editingAddress.id, ...addressForm }).unwrap()
        toast.success("Address updated")
      } else {
        await createAddress({ userId: user.id, ...addressForm }).unwrap()
        toast.success("Address added")
      }
      setIsAddressDialogOpen(false)
    } catch (error) {
      toast.error("Failed to save address")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id).unwrap()
        toast.success("Address deleted")
      } catch (error) {
        toast.error("Failed to delete address")
      }
    }
  }

  if (status === "loading" || isUserLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8" /></div>
  }

  if (!user) {
    return <div className="p-12 text-center text-muted-foreground">Please log in to view your account.</div>
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
        <TabsTrigger value="profile" className="gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="addresses" className="gap-2">
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Addresses</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">Personal Information</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProfile}
              className="gap-2 bg-transparent"
              disabled={isEditingProfile}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={isEditingProfile ? profileName : (user.name ?? '')}
                onChange={(e) => setProfileName(e.target.value)}
                disabled={!isEditingProfile}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email ?? ''} disabled={true} className="mt-1.5" />
            </div>
          </div>

          {isEditingProfile && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isUpdatingUser}>
                {isUpdatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Addresses Tab */}
      <TabsContent value="addresses" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-foreground">Saved Addresses</h2>
          <Button size="sm" className="gap-2" onClick={() => handleOpenAddressDialog()}>
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </div>

        {isAddressesLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((address: any) => (
              <div
                key={address.id}
                className={cn(
                  "bg-card border rounded-xl p-4 relative group",
                  address.isDefault ? "border-primary" : "border-border",
                )}
              >
                {address.isDefault && (
                  <span className="absolute top-3 right-3 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    Default
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{address.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.line1}
                  {address.line2 && <>, {address.line2}</>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.postcode}
                </p>

                <div className="flex gap-2 mt-4 pt-4 border-t border-dashed border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => handleOpenAddressDialog(address)}>
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAddress(address.id)}>
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {addresses.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No addresses found.</p>}
          </div>
        )}

        {/* Address Dialog */}
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              <DialogDescription>
                {editingAddress ? "Update your address details below." : "Enter your new address details below."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Label (e.g. Home, Work)</Label>
                <Input id="label" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="line1">Address Line 1</Label>
                <Input id="line1" value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                <Input id="line2" value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" value={addressForm.postcode} onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default"
                  checked={addressForm.isDefault}
                  onCheckedChange={(checked) => setAddressForm({ ...addressForm, isDefault: checked as boolean })}
                />
                <Label htmlFor="default">Set as default address</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAddress} disabled={isCreatingAddress || isUpdatingAddress}>
                {(isCreatingAddress || isUpdatingAddress) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Address
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

    </Tabs>
  )
}
