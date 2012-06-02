package cn.keke.travelmix.publictransport;

import junit.framework.Assert;

import org.junit.Test;

public class ProviderTest {
    
    @Test
    public void testGetQueryConnectionUrl() {
        String date = "20110601";
        String time = "1810";
        float origLat = 42.123456f;
        float origLng = 8.123456f;
        float destLat = 42.0123456f;
        float destLng = 8.0123456f;
        String url = Provider.KVV.getQueryConnectionUrl(date, time, String.valueOf(origLat), String.valueOf(origLng), String.valueOf(destLat),
                String.valueOf(destLng));
        System.out.println("testGetQueryConnectionUrl: " + url);
        Assert.assertTrue(url.contains(date));
        Assert.assertTrue(url.contains(time));
        Assert.assertTrue(url.contains(String.valueOf(destLat)));
    }
    
}
