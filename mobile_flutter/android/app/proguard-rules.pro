# Flutter
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.embedding.**

# Leccionario mobile - keep only necessary classes
-keep class com.leccionario.mobile.MainActivity { *; }

# Keep annotation
-keepattributes *Annotation*

# Keep serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# sqflite
-keep class com.tekartik.sqflite.** { *; }

# mobile_scanner
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.mlkit.**
-dontwarn com.google.android.gms.**

# connectivity_plus
-keep class dev.flutterconnectivityplus.** { *; }

# web_socket_channel
-keep class io.flutter.plugins.** { *; }
