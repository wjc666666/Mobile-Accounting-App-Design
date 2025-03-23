package com.jceco;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.util.Log;
import android.content.ComponentName;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class AppLauncherModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AppLauncherModule";
    private final ReactApplicationContext reactContext;

    public AppLauncherModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AppLauncher";
    }

    @ReactMethod
    public void openAlipay(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            Intent launchIntent;
            
            // Try to launch Alipay directly
            try {
                launchIntent = pm.getLaunchIntentForPackage("com.eg.android.AlipayGphone");
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(launchIntent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                Log.e(TAG, "Error launching Alipay", e);
            }
            
            // Try Hong Kong Alipay version
            try {
                launchIntent = pm.getLaunchIntentForPackage("hk.alipay.wallet");
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(launchIntent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                Log.e(TAG, "Error launching Alipay HK", e);
            }
            
            // Try to open with URI
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("alipays://"));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e) {
                Log.e(TAG, "Error opening Alipay with URI", e);
            }
            
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("alipay://"));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e) {
                Log.e(TAG, "Error opening Alipay with URI 2", e);
            }
            
            promise.reject("ERROR", "Could not launch Alipay app");
        } catch (Exception e) {
            Log.e(TAG, "Error in openAlipay", e);
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openWeChat(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            Intent launchIntent = pm.getLaunchIntentForPackage("com.tencent.mm");
            
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(launchIntent);
                promise.resolve(true);
                return;
            }
            
            // Try to open with URI
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("weixin://"));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e) {
                Log.e(TAG, "Error opening WeChat with URI", e);
            }
            
            promise.reject("ERROR", "Could not launch WeChat app");
        } catch (Exception e) {
            Log.e(TAG, "Error in openWeChat", e);
            promise.reject("ERROR", e.getMessage());
        }
    }
} 