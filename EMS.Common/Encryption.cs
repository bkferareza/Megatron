using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace EMS.Common
{
    public class RIPEMD160Engine
    {
        Byte[] Key;

        public void InitUnicode(string key)
        {
            //UnicodeEncoding encoding = new System.Text.UnicodeEncoding();
            UnicodeEncoding encoding = new System.Text.UnicodeEncoding();
            Key = encoding.GetBytes(key);
        }

        public void InitAscii(string key)
        {
            UnicodeEncoding encoding = new System.Text.UnicodeEncoding();
            Byte[] Keys = encoding.GetBytes(key);
            Key = new byte[Keys.Length / 2];
            for (int i = 0; i < Keys.Length; i += 2)
            {
                Key[i / 2] = Keys[i];
            }
        }

        public Byte[] ProcessBlock()
        {
            RIPEMD160 myRIPEMD160 = RIPEMD160Managed.Create();
            try
            {
                return myRIPEMD160.ComputeHash(Key);
            }
            finally
            {
                myRIPEMD160.Dispose();
            }
        }
    }

    public interface ICipherParameters
    {
    }

    public class KeyParameter
        : ICipherParameters
    {
        private readonly byte[] key;

        public KeyParameter(
            byte[] key)
        {
            if (key == null)
                throw new ArgumentNullException("key");

            this.key = (byte[])key.Clone();
        }

        public KeyParameter(
            byte[] key,
            int keyOff,
            int keyLen)
        {
            if (key == null)
                throw new ArgumentNullException("key");
            if (keyOff < 0 || keyOff > key.Length)
                throw new ArgumentOutOfRangeException("keyOff");
            if (keyLen < 0 || (keyOff + keyLen) > key.Length)
                throw new ArgumentOutOfRangeException("keyLen");

            this.key = new byte[keyLen];
            Array.Copy(key, keyOff, this.key, 0, keyLen);
        }

        public byte[] GetKey()
        {
            return (byte[])key.Clone();
        }
    }

    /// <remarks>Base interface for a symmetric key block cipher.</remarks>
    public interface IBlockCipher
    {
        /// <summary>The name of the algorithm this cipher implements.</summary>
        string AlgorithmName { get; }

        /// <summary>Initialise the cipher.</summary>
        /// <param name="forEncryption">Initialise for encryption if true, for decryption if false.</param>
        /// <param name="parameters">The key or other data required by the cipher.</param>
        void Init(bool forEncryption, ICipherParameters parameters, int CipherTextLength);

        /// <returns>The block size for this cipher, in bytes.</returns>
        int GetBlockSize();

        /// <summary>Indicates whether this cipher can handle partial blocks.</summary>
        bool IsPartialBlockOkay { get; }

        /// <summary>Process a block.</summary>
        /// <param name="inBuf">The input buffer.</param>
        /// <param name="inOff">The offset into <paramref>inBuf</paramref> that the input block begins.</param>
        /// <param name="outBuf">The output buffer.</param>
        /// <param name="outOff">The offset into <paramref>outBuf</paramref> to write the output block.</param>
        /// <exception cref="DataLengthException">If input block is wrong size, or outBuf too small.</exception>
        /// <returns>The number of bytes processed and produced.</returns>
        int ProcessBlock(byte[] inBuf, int inOff, byte[] outBuf, int outOff);

        /// <summary>
        /// Reset the cipher to the same state as it was after the last init (if there was one).
        /// </summary>
        void Reset();
    }

    public class IdeaEngine
        : IBlockCipher
    {
        private const int BLOCK_SIZE = 8;
        private UInt16[] workingKey;
        private int KeyLength = 0;
        /**
        * standard constructor.
        */
        public IdeaEngine()
        {
        }
        /**
        * initialise an IDEA cipher.
        *
        * @param forEncryption whether or not we are for encryption.
        * @param parameters the parameters required to set up the cipher.
        * @exception ArgumentException if the parameters argument is
        * inappropriate.
        */
        public void Init(bool forEncryption, ICipherParameters parameters, int CipherTextLength)
        {
            if (!(parameters is KeyParameter))
                throw new ArgumentException("invalid parameter passed to IDEA init - " + parameters.GetType().ToString());

            byte[] Key = ((KeyParameter)parameters).GetKey();
            workingKey = GenerateWorkingKey(forEncryption, Key);
            KeyLength = CipherTextLength;
        }

        public string AlgorithmName
        {
            get { return "IDEA"; }
        }

        public bool IsPartialBlockOkay
        {
            get { return false; }
        }

        public int GetBlockSize()
        {
            return BLOCK_SIZE;
        }

        public int ProcessBlock(
            byte[] input,
            int inOff,
            byte[] output,
            int outOff)
        {
            if (workingKey == null)
            {
                throw new InvalidOperationException("IDEA engine not initialised");
            }
            if ((inOff + BLOCK_SIZE) > input.Length)
            {
                throw new Exception("input buffer too short");
            }
            if ((outOff + BLOCK_SIZE) > output.Length)
            {
                throw new Exception("output buffer too short");
            }
            IdeaFunc(workingKey, input, inOff, output, outOff, KeyLength);
            return BLOCK_SIZE;
        }
        public void Reset()
        {
        }
        private static readonly int RANGEMASK = 0x10000;
        private static readonly int MASK = 0xffff;
        private static readonly int BASE = 0x10001;
        private UInt16 BytesToWord(
            byte[] input,
            int inOff)
        {
            return ShiftRoundToUInt16(((input[inOff] << 8) & 0xff00) + (input[inOff + 1] & 0xff));
            //return (input[inOff] << 8) + (input[inOff + 1]);
        }
        private void WordToBytes(
            UInt16 word,
            byte[] outBytes,
            int outOff)
        {
            outBytes[outOff] = (byte)word;
            outBytes[outOff + 1] = (byte)((uint)word >> 8);
            //outBytes[outOff] = (byte)((uint)word >> 8);
            //outBytes[outOff + 1] = (byte)word;
        }
        /**
        * @param x the x value
        * @param y the y value
        * @return x = x * y
        */
        private UInt16 Mul(
            UInt16 x,
            UInt16 y)
        {
            UInt16 result = 0;
            int p = x * y;
            if (p == 0)
            {
                result = SumRoundToUInt16(1 - x - y);
            }
            else
            {
                result = ShiftRoundToUInt16(p >> 16);
                UInt16 t16 = MaskToUInt16(p);
                result = SumRoundToUInt16(t16 - result);
                if (t16 < result)
                {
                    result++;
                }
            }

            return result;
        }
        private void IdeaFunc(
            UInt16[] workingKey,
            byte[] input,
            int inOff,
            byte[] outBytes,
            int outOff,
            int TextSize)
        {
            //Log log = new Log("idea_func");

            UInt16 x1, x2, x3, x4, s2, s3;
            for (int i = 0; i < (TextSize / 2 / BLOCK_SIZE); i++)
            {
                int keyOff = 0;

                UInt16 i2 = BytesToWord(input, inOff);
                inOff += 2;
                UInt16 i1 = BytesToWord(input, inOff);
                inOff += 2;
                UInt16 i4 = BytesToWord(input, inOff);
                inOff += 2;
                UInt16 i3 = BytesToWord(input, inOff);
                inOff += 2;
                //log.AppendInfo("i1 " + i1.ToString());
                //log.AppendInfo("i2 " + i2.ToString());
                //log.AppendInfo("i3 " + i3.ToString());
                //log.AppendInfo("i4 " + i4.ToString());

                x1 = ShiftRoundToUInt16((i1 >> 8) | (i1 << 8));
                x2 = ShiftRoundToUInt16((i2 >> 8) | (i2 << 8));
                x3 = ShiftRoundToUInt16((i3 >> 8) | (i3 << 8));
                x4 = ShiftRoundToUInt16((i4 >> 8) | (i4 << 8));
                //log.AppendInfo("x1 " + x1.ToString());
                //log.AppendInfo("x2 " + x2.ToString());
                //log.AppendInfo("x3 " + x3.ToString());
                //log.AppendInfo("x4 " + x4.ToString());
                for (int round = 8; round > 0; round--)
                {
                    x1 = Mul(x1, workingKey[keyOff++]);
                    x2 += workingKey[keyOff++];
                    x2 = SumRoundToUInt16(x2);
                    x3 += workingKey[keyOff++];
                    x3 = SumRoundToUInt16(x3);
                    x4 = Mul(x4, workingKey[keyOff++]);
                    //*************************
                    //log.AppendInfo("x1 " + x1.ToString());
                    //log.AppendInfo("x2 " + x2.ToString());
                    //log.AppendInfo("x3 " + x3.ToString());
                    //log.AppendInfo("x4 " + x4.ToString());
                    //*************************
                    s3 = x3;
                    x3 = ShiftRoundToUInt16(x3 ^ x1);
                    x3 = Mul(x3, workingKey[keyOff++]);
                    //*************************
                    //log.AppendInfo("x3 " + x3.ToString());
                    //*************************
                    s2 = x2;
                    x2 = ShiftRoundToUInt16(x2 ^ x4);
                    x2 = ShiftRoundToUInt16(x2 + x3);
                    x2 = Mul(x2, workingKey[keyOff++]);
                    x3 = ShiftRoundToUInt16(x3 + x2);
                    //*************************
                    //log.AppendInfo("s3 " + s3.ToString());
                    //log.AppendInfo("x3 " + x3.ToString());
                    //log.AppendInfo("s2 " + s2.ToString());
                    //log.AppendInfo("x2 " + x2.ToString());
                    //*************************
                    x1 = ShiftRoundToUInt16(x1 ^ x2);
                    x4 = ShiftRoundToUInt16(x4 ^ x3);
                    x2 = ShiftRoundToUInt16(x2 ^ s3);
                    x3 = ShiftRoundToUInt16(x3 ^ s2);
                    //*************************
                    //log.AppendInfo("x1 " + x1.ToString());
                    //log.AppendInfo("x2 " + x2.ToString());
                    //log.AppendInfo("x3 " + x3.ToString());
                    //log.AppendInfo("x4 " + x4.ToString());
                    //*************************
                }
                x1 = Mul(x1, workingKey[keyOff++]);
                x3 = ShiftRoundToUInt16(x3 + workingKey[keyOff++]);
                x2 = ShiftRoundToUInt16(x2 + workingKey[keyOff++]);
                x4 = Mul(x4, workingKey[keyOff++]);
                //log.AppendInfo("x1 " + x1.ToString());
                //log.AppendInfo("x2 " + x2.ToString());
                //log.AppendInfo("x3 " + x3.ToString());
                //log.AppendInfo("x4 " + x4.ToString());
                UInt16 o1 = ShiftRoundToUInt16((x1 >> 8) | (x1 << 8));
                UInt16 o2 = ShiftRoundToUInt16((x3 >> 8) | (x3 << 8));
                UInt16 o3 = ShiftRoundToUInt16((x2 >> 8) | (x2 << 8));
                UInt16 o4 = ShiftRoundToUInt16((x4 >> 8) | (x4 << 8));
                //log.AppendInfo("o1 " + o1.ToString());
                //log.AppendInfo("o2 " + o2.ToString());
                //log.AppendInfo("o3 " + o3.ToString());
                //log.AppendInfo("o4 " + o4.ToString());

                WordToBytes(o1, outBytes, outOff);
                outOff += 2;
                WordToBytes(o2, outBytes, outOff);
                outOff += 2;
                WordToBytes(o3, outBytes, outOff);
                outOff += 2;
                WordToBytes(o4, outBytes, outOff);
                outOff += 2;
            }
        }


        private UInt16 MaskToUInt16(int value)
        {
            return Convert.ToUInt16(value & MASK);
        }

        private UInt16 ShiftRoundToUInt16(int value)
        {
            return Convert.ToUInt16(value & MASK);
        }

        private UInt16 SumRoundToUInt16(int value)
        {
            if (value > MASK)
            {
                return Convert.ToUInt16(value - MASK);
            }
            else if (value < 0)
            {
                return Convert.ToUInt16(RANGEMASK - Math.Abs(value));
                //return Convert.ToUInt16(value & MASK);
            }
            else
            {
                return Convert.ToUInt16(value & MASK);
            }
        }

        /**
       * The following function is used to expand the user key to the encryption
       * subkey. 
       */
        private UInt16[] ExpandKey(
            byte[] uKey)
        {
            int i = 0;
            UInt16[] key = new UInt16[52];

            for (i = 0; i < 10; i++)
            {
                key[i] = SumRoundToUInt16((uKey[i * 2] << 8) + (uKey[(i * 2) + 1]));//BytesToWord(uKey, i * 2);
            }

            for (i = 10; i < 52; i++)
            {
                int ShlIndex = (i - 10 + 1) % 10;
                int ShrIndex = (i - 10 + 2) % 10;
                key[i] = ShiftRoundToUInt16((key[((i - 10) / 10) * 10 + ShlIndex] << 9) | (key[((i - 10) / 10) * 10 + ShrIndex] >> 7));
            }
            return key;
        }
        /**
        * This function computes multiplicative inverse using Euclid's Greatest
        * Common Divisor algorithm. Zero and one are self inverse.
        * <p>
        * i.e. x * MulInv(x) == 1 (modulo BASE)
		* </p>
        */
        private UInt16 MulInv(
            UInt16 x)
        {
            UInt16 t0, t1, q, y;

            if (x < 2)
            {
                return x;
            }
            t0 = 1;
            t1 = ShiftRoundToUInt16(BASE / x);
            y = ShiftRoundToUInt16(BASE % x);
            while (y != 1)
            {
                q = ShiftRoundToUInt16(x / y);
                x = ShiftRoundToUInt16(x % y);
                t0 = SumRoundToUInt16(t0 + (t1 * q));
                if (x == 1)
                {
                    return t0;
                }
                q = ShiftRoundToUInt16(y / x);
                y = ShiftRoundToUInt16(y % x);
                t1 = SumRoundToUInt16(t1 + (t0 * q));
            }
            return ShiftRoundToUInt16((1 - t1) & MASK);
        }

        /**
        * The function to invert the encryption subkey to the decryption subkey.
        * It also involves the multiplicative inverse and the additive inverse functions.
        */
        private UInt16[] InvertKey(
            UInt16[] inKey)
        {
            UInt16 t1, t2, t3;
            int p = 52;
            UInt16[] key = new UInt16[52];
            int inOff = 0;

            t1 = MulInv(inKey[inOff++]);
            t2 = SumRoundToUInt16(-inKey[inOff++]);
            t3 = SumRoundToUInt16(-inKey[inOff++]);
            key[--p] = MulInv(inKey[inOff++]);
            key[--p] = t3;
            key[--p] = t2;
            key[--p] = t1;

            for (int round = 0; round < 7; round++)
            {
                t1 = inKey[inOff++];
                t2 = inKey[inOff++];
                key[--p] = t2;
                key[--p] = t1;

                t1 = MulInv(inKey[inOff++]);
                t2 = SumRoundToUInt16(-inKey[inOff++]);
                t3 = SumRoundToUInt16(-inKey[inOff++]);
                key[--p] = MulInv(inKey[inOff++]);
                key[--p] = t2; /* NB: Order */
                key[--p] = t3;
                key[--p] = t1;
            }
            t1 = inKey[inOff++];
            t2 = inKey[inOff++];
            key[--p] = t2;
            key[--p] = t1;

            t1 = MulInv(inKey[inOff++]);
            t2 = SumRoundToUInt16(-inKey[inOff++]);
            t3 = SumRoundToUInt16(-inKey[inOff++]);
            key[--p] = MulInv(inKey[inOff]);
            key[--p] = t3;
            key[--p] = t2;
            key[--p] = t1;
            return key;
        }

        private UInt16[] GenerateWorkingKey(
            bool forEncryption,
            byte[] userKey)
        {
            if (forEncryption)
            {
                return ExpandKey(userKey);
            }
            else
            {
                return InvertKey(ExpandKey(userKey));
            }
        }
    }
}
