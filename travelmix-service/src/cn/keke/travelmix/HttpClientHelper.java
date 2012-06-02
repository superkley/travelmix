/*  Copyright (c) 2010 Xiaoyun Zhu
 * 
 *  Permission is hereby granted, free of charge, to any person obtaining a copy  
 *  of this software and associated documentation files (the "Software"), to deal  
 *  in the Software without restriction, including without limitation the rights  
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
 *  copies of the Software, and to permit persons to whom the Software is  
 *  furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in  
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN  
 *  THE SOFTWARE.  
 */
package cn.keke.travelmix;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.HttpVersion;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.params.CookiePolicy;
import org.apache.http.client.params.HttpClientParams;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.params.HttpProtocolParams;
import org.apache.http.protocol.HTTP;
import org.apache.log4j.Logger;

public class HttpClientHelper {
	private static final Logger LOG = Logger.getLogger(HttpClientHelper.class);
	private static final HttpClient SHARED_HTTP_CLIENT;

	public static HttpClient getNewHttpClient() {
		try {
			SSLSocketFactory sf = new EasySSLSocketFactory();

			// TODO test, if SyncBasicHttpParams is needed
			HttpParams params = new BasicHttpParams();
			HttpProtocolParams.setVersion(params, HttpVersion.HTTP_1_1);
			HttpProtocolParams.setContentCharset(params, HTTP.UTF_8);
			HttpProtocolParams.setUseExpectContinue(params, false);
			HttpProtocolParams.setHttpElementCharset(params, HTTP.UTF_8);
			HttpConnectionParams.setConnectionTimeout(params, 10000);
			HttpConnectionParams.setSocketBufferSize(params, 8192);
			HttpConnectionParams.setLinger(params, 1);
			HttpConnectionParams.setStaleCheckingEnabled(params, false);
			HttpConnectionParams.setSoReuseaddr(params, true);
			HttpConnectionParams.setTcpNoDelay(params, true);
			HttpClientParams.setCookiePolicy(params,
					CookiePolicy.IGNORE_COOKIES);
			HttpClientParams.setAuthenticating(params, false);
			HttpClientParams.setRedirecting(params, false);

			SchemeRegistry registry = new SchemeRegistry();
			registry.register(new Scheme("http", 80, PlainSocketFactory
					.getSocketFactory()));
			registry.register(new Scheme("https", 443, sf));

			ThreadSafeClientConnManager ccm = new ThreadSafeClientConnManager(
					registry, 20, TimeUnit.MINUTES);
			ccm.setMaxTotal(100);
			ccm.setDefaultMaxPerRoute(20);

			return new DefaultHttpClient(ccm, params);
		} catch (Exception e) {
			LOG.warn(
					"Failed to create custom http client. Default http client is created",
					e);
			return new DefaultHttpClient();
		}
	}

	/**
	 * @param query
	 * @return query as map
	 */
	public static Map<String, String> parseQueryMap(String query) {
		String[] params = parseQueryParams(query);
		Map<String, String> map = new HashMap<String, String>();
		for (String param : params) {
			String[] paramSplit = param.split(StringConstants.CHAR_EQUALS);
			String name = paramSplit[0];
			String value = paramSplit[1];
			map.put(name, value);
		}
		return map;
	}

	/**
	 * 
	 * @param queryString
	 * @return escaped '='-separated key value pairs
	 */
	public static String[] parseQueryParams(String queryString) {
		String[] params = queryString.split(StringConstants.CHAR_AND);
		for (int i = 0; i < params.length; i++) {
			String p = params[i];
			if (p.indexOf('%') != -1) {
				try {
					params[i] = URLDecoder.decode(params[i],
							StringConstants.CHARSET_UTF8);
				} catch (UnsupportedEncodingException e) {
					// silently ignore
				}
			}
		}
		return params;
	}

	static {
		SHARED_HTTP_CLIENT = getNewHttpClient();
	}

	public static void doGet(String url, HttpResponseHandler handler) {
		HttpGet method = null;
		try {
			method = new HttpGet(url);
			HttpResponse response = SHARED_HTTP_CLIENT.execute(method);
			handler.handle(response);
			method.abort();
		} catch (Exception e) {
			LOG.warn("Failed to get " + url, e);
			if (method != null) {
				method.abort();
			}
		}
	}

	public static void doGet(String url, Header[] headers,
			HttpResponseHandler handler) {
		HttpGet method = null;
		HttpResponse response = null;
		try {
			method = new HttpGet(url);
			method.setHeaders(headers);
			response = SHARED_HTTP_CLIENT.execute(method);
			handler.handle(response);
		} catch (Exception e) {
			LOG.warn("Failed to get " + url, e);
			if (method != null) {
				method.abort();
			}
		} finally {
			try {
				if (response != null && response.getEntity() != null) {
					IOUtils.closeQuietly(response.getEntity().getContent());
				}
			} catch (Exception e) {
				// ignore
			}
		}
	}

}
