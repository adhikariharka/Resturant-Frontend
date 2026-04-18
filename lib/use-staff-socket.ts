"use client"

import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { API_URL } from "@/lib/store/api"

interface StaffSocketHandlers {
    onNewOrder?: (order: any) => void
    onOrderUpdated?: (payload: { orderId: string; status: string; order: any }) => void
    onConnectChange?: (connected: boolean) => void
}

export function useStaffSocket(enabled: boolean, handlers: StaffSocketHandlers) {
    const socketRef = useRef<Socket | null>(null)
    const handlersRef = useRef(handlers)
    handlersRef.current = handlers

    useEffect(() => {
        if (!enabled) return

        const socket = io(API_URL, {
            transports: ["websocket", "polling"],
            reconnectionAttempts: 10,
            reconnectionDelay: 1500,
        })
        socketRef.current = socket

        socket.on("connect", () => {
            handlersRef.current.onConnectChange?.(true)
            socket.emit("join_staff_room")
        })
        socket.on("disconnect", () => handlersRef.current.onConnectChange?.(false))
        socket.on("new_order", (order: any) => handlersRef.current.onNewOrder?.(order))
        socket.on("order_updated", (payload: any) => handlersRef.current.onOrderUpdated?.(payload))

        return () => {
            socket.off("new_order")
            socket.off("order_updated")
            socket.disconnect()
            socketRef.current = null
        }
    }, [enabled])

    return socketRef
}
