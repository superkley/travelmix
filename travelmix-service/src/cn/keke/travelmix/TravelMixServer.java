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

import java.io.FileWriter;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

import org.apache.log4j.Logger;

import cn.keke.travelmix.publictransport.JsonProxyRouter;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

@SuppressWarnings("restriction")
public class TravelMixServer {
    private static final int                      TRAVEL_MIX_SERVER_PORT = 9080;
    private static final String                   STATUS_FILE            = TravelMixServer.class.getSimpleName() + "_status.log";
    private static final Logger                   LOG                    = Logger.getLogger(TravelMixServer.class);
    private static final Map<String, HttpHandler> HANDLERS               = new HashMap<String, HttpHandler>();

    static {
        HANDLERS.put("/ptRouter", new JsonProxyRouter());
    }

    public static void main(String[] args) {
        InetSocketAddress addr = new InetSocketAddress(TRAVEL_MIX_SERVER_PORT);
        HttpServer server;
        try {
            server = HttpServer.create(addr, 0);
            for (String ctx : HANDLERS.keySet()) {
                HttpHandler httpHandler = HANDLERS.get(ctx);
                server.createContext(ctx, httpHandler);
                LOG.info("'" + ctx + "' created for handler class '" + httpHandler.getClass().getSimpleName() + "'");
            }
            server.setExecutor(Executors.newCachedThreadPool());
            server.start();

            try {
                FileWriter fw = new FileWriter(STATUS_FILE);
                fw.write(new Date() + ": " + TravelMixServer.class.getSimpleName() + " started at port " + TRAVEL_MIX_SERVER_PORT + ".");
                fw.close();
            } catch (Exception e) {
                LOG.error("Failed to write status file: " + e);
            }

            LOG.info(TravelMixServer.class.getSimpleName() + " is listening on port " + TRAVEL_MIX_SERVER_PORT);
        } catch (IOException e) {
            LOG.error("Failed to start " + TravelMixServer.class.getSimpleName() + " on port " + TRAVEL_MIX_SERVER_PORT, e);
        }
    }
}
