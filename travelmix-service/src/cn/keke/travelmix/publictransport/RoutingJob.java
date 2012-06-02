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

import java.util.LinkedList;

public class RoutingJob {
    private boolean            finished;
    private boolean            handled;
    private String             finishedUrl;
    private LinkedList<RoutingTask> urls;

    public RoutingJob() {
        this.finished = false;
        this.urls = new LinkedList<RoutingTask>();
    }

    public void push(RoutingTask task) {
        this.urls.push(task);
    }

    public RoutingTask pop() {
        if (this.urls.isEmpty()) {
            return null;
        } else {
            return this.urls.pop();
        }
    }

    public synchronized boolean setFinished(String url) {
        if (!this.finished) {
            this.finished = true;
            this.finishedUrl = url;
            return true;
        } else {
            return false;
        }
    }

    public boolean isFinished() {
        return this.finished;
    }

    public void setHandled() {
        this.handled = true;
    }

    public boolean isHandled() {
        return this.handled;
    }
}
