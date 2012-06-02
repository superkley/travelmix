package cn.keke.travelmix.publictransport;

import org.junit.Assert;
import org.junit.Test;


public class JsonProxyRouterTest {

    @Test
    public void testGetQueryConnectionUrl() {
        RoutingJob job = JsonProxyRouter.createRoutingJob("origin=49.49070:8.45741&destination=49.48853:8.46041");
        RoutingTask task = null;
        while ((task = job.pop()) != null) {
            String url = task.getUrl();
            Assert.assertTrue(url.contains("8.45741000:49.4907000"));
            Assert.assertTrue(url.contains("8.46041000:49.4885300"));
        }

        job = JsonProxyRouter.createRoutingJob("origin=49.49070930333393:8.457412719726562&destination=49.48853488197713:8.46041679382");
        while ((task = job.pop()) != null) {
            String url = task.getUrl();
            Assert.assertTrue(url.contains("8.45741271:49.4907093"));
            Assert.assertTrue(url.contains("8.46041679:49.4885348"));
        }

    }
}
