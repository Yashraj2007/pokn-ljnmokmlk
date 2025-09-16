"use client"

import { useState, useEffect } from "react"
import { useOfflineSync } from "./useOfflineSync"

export const useAPI = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isOnline, addToSyncQueue } = useOfflineSync()

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isOnline) {
        // Try to get cached data
        const cached = localStorage.getItem(`api-cache-${JSON.stringify(dependencies)}`)
        if (cached) {
          setData(JSON.parse(cached))
          setLoading(false)
          return
        }
      }

      const response = await apiCall()
      const result = response.data

      setData(result)

      // Cache successful responses
      localStorage.setItem(`api-cache-${JSON.stringify(dependencies)}`, JSON.stringify(result))
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred")

      // Try to get cached data on error
      const cached = localStorage.getItem(`api-cache-${JSON.stringify(dependencies)}`)
      if (cached) {
        setData(JSON.parse(cached))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  const mutate = async (mutationCall, optimisticData = null) => {
    try {
      if (optimisticData) {
        setData(optimisticData)
      }

      if (!isOnline) {
        // Queue for offline sync
        addToSyncQueue(mutationCall.data, mutationCall.endpoint, mutationCall.method)
        return
      }

      const response = await mutationCall()
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  return { data, loading, error, mutate, refetch: () => fetchData() }
}
