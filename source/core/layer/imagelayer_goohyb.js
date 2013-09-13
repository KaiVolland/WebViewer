/*******************************************************************************
#      ____               __          __  _      _____ _       _               #
#     / __ \              \ \        / / | |    / ____| |     | |              #
#    | |  | |_ __   ___ _ __ \  /\  / /__| |__ | |  __| | ___ | |__   ___      #
#    | |  | | '_ \ / _ \ '_ \ \/  \/ / _ \ '_ \| | |_ | |/ _ \| '_ \ / _ \     #
#    | |__| | |_) |  __/ | | \  /\  /  __/ |_) | |__| | | (_) | |_) |  __/     #
#     \____/| .__/ \___|_| |_|\/  \/ \___|_.__/ \_____|_|\___/|_.__/ \___|     #
#           | |                                                                #
#           |_|                 _____ _____  _  __                             #
#                              / ____|  __ \| |/ /                             #
#                             | (___ | |  | | ' /                              #
#                              \___ \| |  | |  <                               #
#                              ____) | |__| | . \                              #
#                             |_____/|_____/|_|\_\                             #
#                                                                              #
#                              (c) 2010-2011 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                           martin.christen@fhnw.ch                            #
********************************************************************************
*     Licensed under MIT License. Read the file LICENSE for more information   *
*******************************************************************************/

goog.provide('owg.GoogleHybridLayer');

goog.require('owg.GlobeUtils');
goog.require('owg.OSMImageLayer');
goog.require('owg.MercatorQuadtree');
goog.require('owg.Texture');

//------------------------------------------------------------------------------
/**
 * @constructor
 * @description Image Layer for Google Hybrid
 * @author Kai Volland, kaivolland@yahoo.de
 * @author Feng Lei, fenglgis@gmail.com
 */

function GoogleHybridLayer()
{
   this.servers = null;
   this.layer = null;
   this.quadtree = new MercatorQuadtree();
   this.curserver = 0;
   this.sub = 0;
   this.subs = ["Galile", "Galil", "Gali", "Gal", "Ga", "G"];
   
 
   //---------------------------------------------------------------------------
   this.Ready = function()
   {
      return true;
   }
   //---------------------------------------------------------------------------
   this.Failed = function()
   {
      return false;
   }
   //---------------------------------------------------------------------------
   this.RequestTile = function(engine, quadcode, layer, cbfReady, cbfFailed, caller)
   {
      var coords = new Array(4);
      var res = {};
      this.quadtree.QuadKeyToTileCoord(quadcode, res);
      
      //http://mt1.google.com/vt/lyrs=y&x=2139&y=1422&z=12&s=Ga
      var sFilename = this.servers[this.curserver] + "/vt/lyrs=y"+ 
                      "&x=" + res.x + 
                      "&y=" + res.y +
                      "&z=" + res.lod +
                      "&s=" + this.subs[this.sub];

      this.sub++;
      if (this.sub == 5) this.sub = 0;

      var ImageTexture = new Texture(engine);  
      ImageTexture.quadcode = quadcode;   // store quadcode in texture object
      ImageTexture.layer = layer;
      ImageTexture.cbfReady = cbfReady;   // store the ready callback in texture object
      ImageTexture.cbfFailed = cbfFailed; // store the failure callback in texture object
      ImageTexture.caller = caller;
      ImageTexture.loadTexture(sFilename, _cbOSMTileReady, _cbOSMTileFailed, true); 
  
 
      this.curserver++;
      if (this.curserver>=this.servers.length)
      {
         this.curserver = 0;
      }
 
   };
   //---------------------------------------------------------------------------
   this.GetMinLod = function()
   {
      return 0;
   }
   
   //---------------------------------------------------------------------------
   this.GetMaxLod = function()
   {
      return 19;
   }
   
   //---------------------------------------------------------------------------
   this.Contains = function(quadcode)
   {
      if (quadcode.length<20)
      {
         return true;
      }  
      return false;
   }
   //---------------------------------------------------------------------------
   
   this.Setup = function(serverlist)
   {
      // Please respect: http://wiki.openstreetmap.org/wiki/Tile_Usage_Policy
      
      // serverlist:
      //   ["http://a.tile.openstreetmap.org", "http://b.tile.openstreetmap.org", "http://c.tile.openstreetmap.org" ]
      //   or your own tileserver(s).
      // 
      
      this.servers = serverlist;

   }
}

GoogleHybridLayer.prototype = new OSMImageLayer();

//------------------------------------------------------------------------------

