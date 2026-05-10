# Capacitor plugins rely on reflection via @CapacitorPlugin / @PluginMethod.
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keepclasseswithmembers class * {
    @com.getcapacitor.annotation.* <methods>;
    @com.getcapacitor.PluginMethod <methods>;
}

# JS <-> Java bridge: anything exposed via @JavascriptInterface must survive R8.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep generic plugin metadata Capacitor reflects on at runtime.
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod

# AndroidX splashscreen (compat code paths)
-keep class androidx.core.splashscreen.** { *; }

# Cordova plugins fallback layer added by Capacitor.
-keep class org.apache.cordova.** { *; }

# WebView -> JS interface example (uncomment if you wire one up):
#-keepclassmembers class app.logogames.client.YourBridge {
#    public *;
#}
