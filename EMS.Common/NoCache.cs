using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EMS.Common
{
    public class NoCache : ICache
    {
        public object Get(string key)
        {
            return null;
        }

        public void Set(string key, object value)
        {
            
        }

        public void Remove(string key)
        {
            
        }
    }
}
