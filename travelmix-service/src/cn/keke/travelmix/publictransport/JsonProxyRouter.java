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
package cn.keke.travelmix.publictransport;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.zip.GZIPOutputStream;

import cn.keke.travelmix.ExecutorUtils;
import cn.keke.travelmix.HttpClientHelper;
import cn.keke.travelmix.StringUtils;
import cn.keke.travelmix.publictransport.type.EfaConnectionUrl;

import org.apache.http.Header;
import org.apache.http.message.BasicHeader;
import org.apache.log4j.Logger;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

/**
 * PublicTransportRouter interprets route request, sends it to a chosen public transport provider and converts the provider response in an well-known json
 * format.
 */
@SuppressWarnings("restriction")
public class JsonProxyRouter implements HttpHandler {
    private static final Logger LOG = Logger.getLogger(JsonProxyRouter.class);

    public void handle(HttpExchange xchg) throws IOException {
        try {
            StringBuffer response = new StringBuffer(4096);
            String query = xchg.getRequestURI().getRawQuery();
            String callbackMethod = HttpClientHelper.parseQueryMap(query).get("callback");
            response.append(callbackMethod).append("(");
            LOG.info(query);
            if (StringUtils.isNotEmpty(query)) {
                RoutingJob job = createRoutingJob(query);
                if (job != null) {
                    RoutingTask task = null;
                    Header[] headers = convertRequestHeaders(xchg.getRequestHeaders());
                    List<Future<String>> futures = new ArrayList<Future<String>>(Provider.values().length);
                    while ((task = job.pop()) != null) {
                        task.setHeaders(headers);
                        task.setResponse(response);
                        futures.add(ExecutorUtils.THREAD_POOL.submit(task));
                    }
                    for(Future<String> future : futures){
                        if (job.isHandled()) {
                            System.out.println("Finished: " + job);
                            break;
                        } else {
                            future.get();
                        }
                    }
                }
            }
            response.append(");");
            xchg.getResponseHeaders().set("Content-Encoding", "gzip");
            xchg.sendResponseHeaders(HttpURLConnection.HTTP_OK, 0);
            GZIPOutputStream os = new GZIPOutputStream(xchg.getResponseBody());
            LOG.info(response.toString());
            os.write(response.toString().getBytes());
            os.finish();
            xchg.close();
        } catch (Exception e) {
            LOG.warn("Json Routing Request failed", e);
        }
    }

    private Header[] convertRequestHeaders(Headers requestHeaders) {
        Header[] headers = new Header[requestHeaders.size()];
        int i = 0;
        for (String key : requestHeaders.keySet()) {
            headers[i++] = new BasicHeader(key, requestHeaders.getFirst(key));
        }
        return headers;
    }

    public static RoutingJob createRoutingJob(String query) {
        Map<String, String> params = HttpClientHelper.parseQueryMap(query);
        String origin = params.get("origin");
        String destination = params.get("destination");
        String date = params.get("date");
        String time = params.get("time");
        if (origin != null && destination != null) {
            int origSepPos = origin.indexOf(':');
            int destSepPos = destination.indexOf(':');
            if (origSepPos != -1 && destSepPos != -1) {
                String origLat = origin.substring(0, Math.min(EfaConnectionUrl.COORDINATE_LENGTH, origSepPos));
                String origLng = origin.substring(origSepPos + 1, Math.min(EfaConnectionUrl.COORDINATE_LENGTH + origSepPos + 1, origin.length()));
                String destLat = destination.substring(0, Math.min(EfaConnectionUrl.COORDINATE_LENGTH, destSepPos));
                String destLng = destination.substring(destSepPos + 1, Math.min(EfaConnectionUrl.COORDINATE_LENGTH + destSepPos + 1, destination.length()));

                if (StringUtils.isNullOrEmpty(date) || StringUtils.isNullOrEmpty(time) || date.length() != 8 || time.length() != 4) {
                    Calendar now = Calendar.getInstance();
                    date = String.valueOf(now.get(Calendar.YEAR) * 10000 + (now.get(Calendar.MONTH) + 1) * 100 + now.get(Calendar.DAY_OF_MONTH));
                    time = String.valueOf(10000 + now.get(Calendar.HOUR_OF_DAY) * 100 + now.get(Calendar.MINUTE)).substring(1);
                }

                return Provider.createRoutingJob(date, time, origLat, origLng, destLat, destLng);
            }
        }
        return null;
    }
}
