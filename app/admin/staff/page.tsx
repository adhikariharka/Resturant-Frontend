"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Truck, ChefHat, Search, DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useGetStaffQuery, useCreateStaffMutation } from "@/lib/store/api"

const staffSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    permissions: z.array(z.string()).refine((value) => value.length > 0, {
        message: "You must select at least one role.",
    }),
})

type StaffFormValues = z.infer<typeof staffSchema>

const StaffManagementPage = () => {
    // RTK Query hooks
    const { data: staffList = [], isLoading, error } = useGetStaffQuery(undefined)
    const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation()

    // Local state for search
    const [searchQuery, setSearchQuery] = useState("")

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            username: "",
            password: "",
            permissions: [],
        },
    })

    // Filter staff based on search query
    const filteredStaff = staffList.filter((staff: any) =>
        staff.username.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const onSubmit = async (data: StaffFormValues) => {
        try {
            await createStaff({
                ...data,
                name: data.username,
                role: 'staff'
            }).unwrap()
            toast.success("Staff member created successfully")
            form.reset()
        } catch (err: any) {
            // Check for conflict error (409)
            if (err.status === 409) {
                toast.error("Username is already taken")
            } else {
                toast.error("Failed to create staff member")
            }
        }
    }

    if (error) {
        toast.error("Failed to load staff members")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">
                        Manage access for kitchen and delivery staff.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create Staff Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Staff</CardTitle>
                        <CardDescription>
                            Create a new account for kitchen or delivery personnel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. chef_john" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="e.g. secret123" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Visible for setup. Share this with the staff member.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="permissions"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-4">
                                                <FormLabel className="text-base">Roles (Permissions)</FormLabel>
                                                <FormDescription>
                                                    Select the areas this staff member can access.
                                                </FormDescription>
                                            </div>
                                            <div className="flex flex-col gap-2"> {/* Checkboxes */}
                                                <FormField
                                                    key="kitchen"
                                                    control={form.control}
                                                    name="permissions"
                                                    render={({ field }: { field: any }) => {
                                                        return (
                                                            <FormItem
                                                                key="kitchen"
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes("kitchen")}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, "kitchen"])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value: string) => value !== "kitchen"
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal flex items-center gap-2">
                                                                    <ChefHat className="h-4 w-4" />
                                                                    Kitchen Display (Cooking View)
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                                <FormField
                                                    key="delivery"
                                                    control={form.control}
                                                    name="permissions"
                                                    render={({ field }: { field: any }) => {
                                                        return (
                                                            <FormItem
                                                                key="delivery"
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes("delivery")}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, "delivery"])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value: string) => value !== "delivery"
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal flex items-center gap-2">
                                                                    <Truck className="h-4 w-4" />
                                                                    Delivery Driver (On Way View)
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                                <FormField
                                                    key="temporary_status"
                                                    control={form.control}
                                                    name="permissions"
                                                    render={({ field }: { field: any }) => {
                                                        return (
                                                            <FormItem
                                                                key="temporary_status"
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes("temporary_status")}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, "temporary_status"])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value: string) => value !== "temporary_status"
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal flex items-center gap-2">
                                                                    <DoorOpen className="h-4 w-4" />
                                                                    Manager (Can Open/Close)
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Staff List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Staff</CardTitle>
                        <CardDescription>
                            List of all registered staff members.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search staff..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredStaff.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No staff members found.
                            </div>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[150px]">Username</TableHead>
                                            <TableHead>Roles</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStaff.map((staff: any) => (
                                            <TableRow key={staff.id}>
                                                <TableCell className="font-medium">{staff.username}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {staff.permissions && Array.isArray(staff.permissions) && staff.permissions.map((p: string) => (
                                                            <span key={p} className="text-xs bg-secondary px-2 py-1 rounded-full capitalize">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default StaffManagementPage
