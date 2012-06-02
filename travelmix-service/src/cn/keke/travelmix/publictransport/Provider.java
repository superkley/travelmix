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

import cn.keke.travelmix.publictransport.type.EfaConnectionUrl;

public enum Provider {
    /**
     * Germany, Baden-Württemberg, Mannheim
     */
    VRN {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://fahrplanauskunft.vrn.de/vrn_mobile/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },

    /**
     * Germany, Baden-Württemberg, Karlsruhe
     */
    KVV {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://213.144.24.66/kvv/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
        
        public boolean supportsZippedStream() {
            return false;
        }

    },

    /**
     * Italy
     */
    ATC {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://tpweb.atc.bo.it/atc2/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },

    /**
     * Germany, Augsburg
     */
    AVV {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.avv-augsburg.de/avv/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * 
     */
    // BSAG {
    // private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://62.206.133.180/bsag/XML_TRIP_REQUEST2");
    //
    // public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
    // return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
    // }
    // },
    /**
     * 
     */
    BSVAG {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://212.68.73.240/bsvag/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }

        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Austria
     */
    // BVB {
    // private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.efa-bvb.ch/bvb/XML_TRIP_REQUEST2");
    //
    // public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
    // return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
    // }
    // },
    /**
     * Germany, Ulm
     */
    DING {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.ding-ulm.de/ding2/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * 
     */
    DUB {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://wojhati.rta.ae/dub/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Germany
     */
    GVH {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://mobil.gvh.de/mobile3/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
        
        
        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Austria
     */
    IVB {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.ivb.at/ivb/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Austria, Linz
     */
    LINZ {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.linzag.at/linz/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * 
     */
    /*
    MARIBOR {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://164.8.32.183/slo/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    */
    /**
     * 
     */
    // MET {
    // private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://jp.metlinkmelbourne.com.au/metlink/XML_TRIP_REQUEST2");
    //
    // public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
    // return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
    // }
    // },
    /**
     * Germany
     */
    MVG {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://mobil.mvg-online.de/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
        

        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Germany, Bayern, München
     */
    MVV {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.mvv-muenchen.de/mobile/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Germany
     */
    NALDO {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.naldo.de/naldo/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Germany
     */
    NPH {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.nph.de/nph/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }

        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Germany, Baden-Württemberg
     */
    NVBW {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.efa-bw.de/nvbw/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * 
     */
    // SF {
    // private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://tripplanner.transit.511.org/mtc/XML_TRIP_REQUEST2");
    //
    // public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
    // return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
    // }
    // },
    /**
     * Austria
     */
    STV {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://fahrplan.verbundlinie.at/stv/XML_TRIP_REQUEST2");

        public boolean supportsZippedStream() {
            return false;
        }

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Austria
     */
    SVV {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.svv-info.at/svv/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Australian
     */
    SYDNEY {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://mobile.131500.com.au/TripPlanner/mobile/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * UK
     */
    TFL {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://journeyplanner.tfl.gov.uk/user/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * UK
     */
    TLEA {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.travelineeastanglia.org.uk/ea/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * UK
     */
    TLEM {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.travelineeastmidlands.co.uk/em/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * UK
     */
    TLSE {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.travelinesoutheast.org.uk/se/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * UK
     */
    TLSW {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.travelinesw.com/swe/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Germany, Freiburg
     */
    VAGFR {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.vag-freiburg.de/vagfr/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Austria
     */
    VBL {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://mobil.vbl.ch/vblmobil/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Austria
     */
    VMOBIL {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efaneu.vmobil.at/vvvmobile/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * 
     */
    VMS {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://www.vms-aktuell.de/vms/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * 
     */
    VMV {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://80.146.180.107/delfi/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }

        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Austria
     */
    VOR {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.vor.at/wvb/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }

        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Germany
     */
    VRR {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://app.vrr.de/standard/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Germany
     */
    VRT {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa9.vrn.de/vrt/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    },
    /**
     * Germany
     */
    VVM {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.mobilitaetsverbund.de/web/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }

        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Germany
     */
    VVO {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://efa.vvo-online.de:8080/dvb/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }

        public boolean supportsZippedStream() {
            return false;
        }
    },
    /**
     * Germany
     */
    VVS {
        private final EfaConnectionUrl connectionUrl = new EfaConnectionUrl("http://mobil.vvs.de/mobile/XML_TRIP_REQUEST2");

        public String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng) {
            return this.connectionUrl.getConnectionsUrl(date, time, origLat, origLng, destLat, destLng);
        }
    };
    public abstract String getQueryConnectionUrl(String date, String time, String origLat, String origLng, String destLat, String destLng);

    public static final RoutingJob createRoutingJob(String date, String time, String origLat, String origLng, String destLat, String destLng) {
        RoutingJob job = new RoutingJob();
        for (Provider p : Provider.values()) {
            RoutingTask task = new RoutingTask(p.getQueryConnectionUrl(date, time, origLat, origLng, destLat, destLng), p.supportsZippedStream(), job);
            job.push(task);
        }
        return job;
    }

    public boolean supportsZippedStream() {
        return true;
    }
}
