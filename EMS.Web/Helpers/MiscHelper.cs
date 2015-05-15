using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Web;

namespace EMS.Web.Helpers
{
    public static class MiscHelper
    {
        public static MediaTypeHeaderValue GetMediaTypeHeaderValue(string fileName)
        {
            string extension = fileName.Substring(fileName.LastIndexOf('.') + 1);

            switch (extension)
            {
                case "png": return new MediaTypeHeaderValue("image/png");
                case "jpg": return new MediaTypeHeaderValue("image/jpeg");
                default: return null;
            }
        }

        public static string GetFileExtension(string fileName)
        {
            return fileName.Substring(fileName.LastIndexOf('.') + 1);
        }
    }
}