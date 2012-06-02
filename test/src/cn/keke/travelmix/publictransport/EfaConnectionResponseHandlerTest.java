package cn.keke.travelmix.publictransport;

import java.io.IOException;
import java.util.LinkedList;

import cn.keke.travelmix.FileUtils;
import cn.keke.travelmix.publictransport.type.EfaConnectionResponseHandler;
import cn.keke.travelmix.publictransport.type.PartialRoute;
import cn.keke.travelmix.publictransport.type.RouteResult;

import org.junit.Test;

public class EfaConnectionResponseHandlerTest {
    
    @Test
    public void testGetQueryConnectionUrl() throws IOException {
        EfaConnectionResponseHandler handler = new EfaConnectionResponseHandler(null, true, null, null);
        String testResponse = FileUtils.readFileAsString("D:\\vrn_route_request.xml");
        LinkedList<PartialRoute> partialRoutes = handler.parseExternalRouteResponse(testResponse);

        RouteResult result = handler.readRouteInfo(partialRoutes);
        StringBuffer sb = new StringBuffer();
        handler.createRouteResponse(sb, result);
        System.out.println(sb.toString());
    }
    
}
