"use client"

import { useState, useEffect } from "react"

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSync, setPendingSync] = useState([])

  useEffect(() => {
    const handleOnline = () => {
      console.log(" Network status: Online")
      setIsOnline(true)
      syncPendingData()
    }

    const handleOffline = () => {
      console.log(" Network status: Offline")
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Load pending sync items from localStorage on mount
    loadPendingSync()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadPendingSync = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("pmis-sync-queue") || "[]")
      setPendingSync(stored)
      console.log(" Loaded pending sync items:", stored.length)
    } catch (error) {
      console.error(" Failed to load pending sync items:", error)
      setPendingSync([])
    }
  }

  const addToSyncQueue = (data, endpoint, method = "POST") => {
    const syncItem = {
      id: Date.now(),
      data,
      endpoint,
      method,
      timestamp: new Date().toISOString(),
    }

    console.log(" Adding to sync queue:", syncItem)
    setPendingSync((prev) => [...prev, syncItem])

    // Store in localStorage for persistence
    try {
      const stored = JSON.parse(localStorage.getItem("pmis-sync-queue") || "[]")
      stored.push(syncItem)
      localStorage.setItem("pmis-sync-queue", JSON.stringify(stored))
    } catch (error) {
      console.error(" Failed to store sync item:", error)
    }

    // If online, try to sync immediately
    if (isOnline) {
      syncPendingData()
    }
  }

  const syncPendingData = async () => {
    console.log(" Starting sync of pending data...")

    try {
      const stored = JSON.parse(localStorage.getItem("pmis-sync-queue") || "[]")

      if (stored.length === 0) {
        console.log(" No pending sync items")
        return
      }

      console.log(" Syncing", stored.length, "pending items")
      const successfulSyncs = []

      for (const item of stored) {
        try {
          const apiBaseUrl =
            import.meta.env.VITE_API_BASE_URL ||
            import.meta.env.VITE_API_URL + "/api" ||
            process.env.REACT_APP_API_URL ||
            "http://localhost:4000/api"

          const fullUrl = item.endpoint.startsWith("http") ? item.endpoint : `${apiBaseUrl}${item.endpoint}`

          console.log(" Syncing item:", item.id, "to", fullUrl)

          const response = await fetch(fullUrl, {
            method: item.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("pmis-auth-token") || ""}`,
            },
            body: JSON.stringify(item.data),
          })

          if (response.ok) {
            console.log(" Successfully synced item:", item.id)
            successfulSyncs.push(item.id)
          } else {
            console.error(" Sync failed for item:", item.id, "Status:", response.status)
          }
        } catch (error) {
          console.error(" Sync failed for item:", item.id, error)
        }
      }

      // Remove successfully synced items
      if (successfulSyncs.length > 0) {
        const updated = stored.filter((syncItem) => !successfulSyncs.includes(syncItem.id))
        localStorage.setItem("pmis-sync-queue", JSON.stringify(updated))
        setPendingSync(updated)
        console.log(" Removed", successfulSyncs.length, "synced items,", updated.length, "remaining")
      }
    } catch (error) {
      console.error(" Failed to sync pending data:", error)
    }
  }

  const clearSyncQueue = () => {
    console.log(" Clearing sync queue")
    localStorage.removeItem("pmis-sync-queue")
    setPendingSync([])
  }

  return {
    isOnline,
    pendingSync: pendingSync.length,
    addToSyncQueue,
    syncPendingData,
    clearSyncQueue,
  }
}
