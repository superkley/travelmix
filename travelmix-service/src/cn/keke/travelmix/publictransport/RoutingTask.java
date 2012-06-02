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

import java.util.concurrent.Callable;

import cn.keke.travelmix.HttpClientHelper;
import cn.keke.travelmix.publictransport.type.EfaConnectionResponseHandler;

import org.apache.http.Header;

public class RoutingTask implements Callable<String> {
    private final RoutingJob job;
    private final String     url;
    private final boolean    zipped;
    private StringBuffer     response;
    private Header[]         headers;

    public RoutingTask(String url, boolean zipped, RoutingJob job) {
        this.job = job;
        this.url = url;
        this.zipped = zipped;
    }

    public String call() throws Exception {
        if (!this.job.isFinished()) {
            HttpClientHelper.doGet(this.url, this.headers, new EfaConnectionResponseHandler(this.url, this.zipped, this.response, job));
        }
        return this.url;
    }

    public void setResponse(StringBuffer response) {
        this.response = response;
    }

    public StringBuffer getResponse() {
        return response;
    }

    public void setHeaders(Header[] headers) {
        this.headers = headers;
    }

    public Header[] getHeaders() {
        return headers;
    }

    public String getUrl() {
        return url;
    }

}
