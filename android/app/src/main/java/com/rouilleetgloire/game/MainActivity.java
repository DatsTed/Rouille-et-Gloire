package com.rouilleetgloire.game;

import android.app.Activity;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.webkit.JavascriptInterface;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Coque Android de Rouille & Gloire : une WebView qui affiche le jeu.
 * - Le jeu est embarqué dans l'APK (assets/www/index.html) et marche donc dès l'installation.
 * - Au lancement, l'appli regarde si une version plus récente est publiée (version.json) ;
 *   si oui, elle la télécharge et l'utilisera au prochain lancement. Pas besoin de réinstaller.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private WebView web;
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        prefs = getSharedPreferences("rg", MODE_PRIVATE);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#06070E"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/", new WebViewAssetLoader.PathHandler() {
                    @Override
                    public WebResourceResponse handle(String path) {
                        if (path.isEmpty() || path.equals("index.html")) {
                            try {
                                return new WebResourceResponse("text/html", "utf-8", openGame());
                            } catch (Exception e) {
                                return null;
                            }
                        }
                        return null;
                    }
                })
                .build();

        web.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void setLandscape(final boolean on) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        setRequestedOrientation(on ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
                    }
                });
            }
        }, "RGNative");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
        });
        web.loadUrl("https://" + HOST + "/index.html");
        checkUpdate();
    }

    /** La version téléchargée si elle est plus récente que celle de l'APK, sinon celle de l'APK. */
    private InputStream openGame() throws Exception {
        File g = new File(getFilesDir(), "game.html");
        if (g.exists() && prefs.getInt("v", 0) > BuildConfig.VERSION_CODE) return new FileInputStream(g);
        return getAssets().open("www/index.html");
    }

    private void checkUpdate() {
        final String base = BuildConfig.UPDATE_URL;
        if (base == null || base.isEmpty()) return;
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    String j = new String(fetch(base + "version.json"), "utf-8");
                    int v = new JSONObject(j).getInt("v");
                    int cur = Math.max(BuildConfig.VERSION_CODE, prefs.getInt("v", 0));
                    if (v <= cur) return;
                    byte[] html = fetch(base + "game.html");
                    if (html.length < 500000) return;
                    File tmp = new File(getFilesDir(), "game.tmp");
                    OutputStream o = new FileOutputStream(tmp);
                    o.write(html);
                    o.close();
                    File g = new File(getFilesDir(), "game.html");
                    if (g.exists()) g.delete();
                    if (tmp.renameTo(g)) {
                        prefs.edit().putInt("v", v).apply();
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                Toast.makeText(MainActivity.this,
                                        "Mise à jour téléchargée : ferme et relance le jeu pour l'appliquer.",
                                        Toast.LENGTH_LONG).show();
                            }
                        });
                    }
                } catch (Exception ignored) {
                    /* pas de réseau ou pas de mise à jour : on continue avec la version installée */
                }
            }
        }).start();
    }

    private byte[] fetch(String u) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(30000);
        c.setUseCaches(false);
        try {
            if (c.getResponseCode() != 200) throw new Exception("http " + c.getResponseCode());
            InputStream in = c.getInputStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            in.close();
            return out.toByteArray();
        } finally {
            c.disconnect();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
        web.pauseTimers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        web.resumeTimers();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
