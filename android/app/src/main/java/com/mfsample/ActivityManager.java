package com.mfsample;

import android.app.Activity;

import java.util.ArrayList;
import java.util.List;

public class ActivityManager {
    private static ActivityManager instance;
    private List<Activity> activities;

    private ActivityManager() {
        activities = new ArrayList<>();
    }

    public static synchronized ActivityManager getInstance() {
        if (instance == null) {
            instance = new ActivityManager();
        }
        return instance;
    }

    public void addActivity(Activity activity) {
        activities.add(activity);
    }

    public void removeActivity(Activity activity) {
        activities.remove(activity);
    }

    public void finishActivity(Class<?> clazz) {
        for (Activity activity : activities) {
            if (activity.getClass().equals(clazz)) {
                activity.finish();
                break;
            }
        }
    }

    public boolean hasActivity(Class<?> clazz) {
        boolean isActivityAvailable = false;
        for (Activity activity : activities) {
            if (activity.getClass().equals(clazz)) {
                isActivityAvailable = true;
                break;
            }
        }
        return isActivityAvailable;
    }

}
