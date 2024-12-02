package com.mirrorfly_rn

import android.app.Activity

class ActivityManager private constructor() {
    private val activities: MutableList<Activity> =
        ArrayList()

    fun addActivity(activity: Activity) {
        activities.add(activity)
    }

    fun removeActivity(activity: Activity) {
        activities.remove(activity)
    }

    fun finishActivity(clazz: Class<*>) {
        for (activity in activities) {
            if (activity.javaClass == clazz) {
                activity.finish()
                break
            }
        }
    }

    fun hasActivity(clazz: Class<*>): Boolean {
        var isActivityAvailable = false
        for (activity in activities) {
            if (activity.javaClass == clazz) {
                isActivityAvailable = true
                break
            }
        }
        return isActivityAvailable
    }

    companion object {
        @get:Synchronized
        var instance: ActivityManager? = null
            get() {
                if (field == null) {
                    field = ActivityManager()
                }
                return field
            }
            private set
    }
}
