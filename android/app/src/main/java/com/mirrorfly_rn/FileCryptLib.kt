/*
 * @category ContusFly
 * @copyright Copyright (C) 2017 Contus. All rights reserved.
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */
package com.mirrorfly_rn


import android.os.Build
import android.util.Base64
import androidx.annotation.Keep
import java.io.UnsupportedEncodingException
import java.nio.charset.StandardCharsets
import java.security.InvalidAlgorithmParameterException
import java.security.InvalidKeyException
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException
import javax.crypto.BadPaddingException
import javax.crypto.Cipher
import javax.crypto.Cipher.getInstance
import javax.crypto.IllegalBlockSizeException
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

/*****************************************************************
 * CrossPlatform FileCryptLib
 *
 *
 * This cross platform FileCryptLib uses AES 256 for encryption. This library can be used for encryption
 * and decryption of string on iOS, Android and Windows platform.
 *
 *
 * Features:
 *
 *
 * 1. 256 bit AES encryption
 * 2. Provision for SHA256 hashing of key.
 */
@Keep
class FileCryptLib {

    /**
     * Initialize the cipher with transformation AES/CBC/PKCS7Padding
     */
    private val _cx: Cipher = getInstance("AES/CBC/PKCS7Padding") // NOSONAR

    /**
     * 256 bit key space
     */
    private val _key: ByteArray = ByteArray(32)

    /**
     * 128 bit IV
     */
    private val _iv: ByteArray = ByteArray(16)

    @Throws(
        InvalidKeyException::class,
        UnsupportedEncodingException::class,
        InvalidAlgorithmParameterException::class,
        IllegalBlockSizeException::class,
        BadPaddingException::class
    )
    fun encryptFile(_key: String, _iv: String): Cipher {
        return encryptDecryptFile(_key, EncryptMode.ENCRYPT, _iv)
    }

    @Throws(
        InvalidKeyException::class,
        UnsupportedEncodingException::class,
        InvalidAlgorithmParameterException::class,
        IllegalBlockSizeException::class,
        BadPaddingException::class
    )
    fun decryptFile(_key: String, _iv: String): Cipher {
        return encryptDecryptFile(_key, EncryptMode.DECRYPT, _iv)
    }

    /**
     * @param encryptionKey Encryption key to used for encryption / decryption
     * @param mode          specify the mode encryption / decryption
     * @param initVector    Initialization vector
     *
     * @return encrypted or decrypted Cipher Instance based on the mode
     *
     * @throws UnsupportedEncodingException
     * @throws InvalidKeyException
     * @throws InvalidAlgorithmParameterException
     * @throws IllegalBlockSizeException
     * @throws BadPaddingException
     */
    @Throws(
        UnsupportedEncodingException::class,
        InvalidKeyException::class,
        InvalidAlgorithmParameterException::class,
        IllegalBlockSizeException::class,
        BadPaddingException::class
    )
    private fun encryptDecryptFile(
        encryptionKey: String, mode: EncryptMode, initVector: String
    ): Cipher {
        /**
         * _encryptionKey = md5(_encryptionKey);
         * length of the key provided
         */
        var len = encryptionKey.toByteArray(StandardCharsets.UTF_8).size
        if (encryptionKey.toByteArray(StandardCharsets.UTF_8).size > _key.size)
            len = _key.size

        var ivlen = initVector.toByteArray(StandardCharsets.UTF_8).size
        if (initVector.toByteArray(StandardCharsets.UTF_8).size > _iv.size)
            ivlen = _iv.size

        System.arraycopy(encryptionKey.toByteArray(StandardCharsets.UTF_8), 0, _key, 0, len)
        System.arraycopy(initVector.toByteArray(StandardCharsets.UTF_8), 0, _iv, 0, ivlen)

        /**
         * Create a new SecretKeySpec
         */
        val keySpec = SecretKeySpec(_key, "AES")

        /**
         * Create a new IvParameterSpec instance with the bytes from the specified buffer iv used as initialization vector.
         */
        val ivSpec = IvParameterSpec(_iv)

        if (mode == EncryptMode.ENCRYPT) // Encryption
            _cx.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec) // Initialize this cipher instance

        if (mode == EncryptMode.DECRYPT) // Decryption
            _cx.init(Cipher.DECRYPT_MODE, keySpec, ivSpec) // Initialize this cipher instance
        return _cx  // Return encrypted/decrypted cipher instance
    }

    /**
     * @param inputByteArray     Text to be encrypted or decrypted
     * @param encryptionKey Encryption key to used for encryption / decryption
     * @param mode          specify the mode encryption / decryption
     * @param initVector    Initialization vector
     * @return encrypted or decrypted string based on the mode
     * @throws UnsupportedEncodingException
     * @throws InvalidKeyException
     * @throws InvalidAlgorithmParameterException
     * @throws IllegalBlockSizeException
     * @throws BadPaddingException
     */
    @Throws(
        UnsupportedEncodingException::class,
        InvalidKeyException::class,
        InvalidAlgorithmParameterException::class,
        IllegalBlockSizeException::class,
        BadPaddingException::class
    )
    private fun encryptDecryptFile(
        inputByteArray: ByteArray,
        encryptionKey: String,
        mode: EncryptMode,
        initVector: String
    ): ByteArray {

        var outPutByteArray = inputByteArray // Output byte array

        /**
         * _encryptionKey = md5(_encryptionKey);
         * length of the key provided
         */
        var len = encryptionKey.toByteArray(StandardCharsets.UTF_8).size
        if (encryptionKey.toByteArray(StandardCharsets.UTF_8).size > _key.size)
            len = _key.size

        var ivlen = initVector.toByteArray(StandardCharsets.UTF_8).size
        if (initVector.toByteArray(StandardCharsets.UTF_8).size > _iv.size)
            ivlen = _iv.size

        System.arraycopy(encryptionKey.toByteArray(StandardCharsets.UTF_8), 0, _key, 0, len)
        System.arraycopy(initVector.toByteArray(StandardCharsets.UTF_8), 0, _iv, 0, ivlen)

        /**
         * Create a new SecretKeySpec
         */
        val keySpec = SecretKeySpec(_key, "AES")

        /**
         * Create a new IvParameterSpec instance with the bytes from the specified buffer iv
         * used as initialization vector.
         */
        val ivSpec = IvParameterSpec(_iv)

        if (mode == EncryptMode.ENCRYPT) { // Encryption
            /**
             * Read
             * https://android-developers.blogspot.com/2013/08/some-securerandom-thoughts.html
             * for more info.
             */
            _cx.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec) // Initialize this cipher instance.
            val results = _cx.doFinal(inputByteArray)

            val outputBytes = if (Build.VERSION.SDK_INT >= 26) {
                java.util.Base64.getEncoder().encode(results)
            } else Base64.encode(results, 0)

            outPutByteArray = outputBytes // Multi-part, transformation and (encryption) Ciphertext
        }

        if (mode == EncryptMode.DECRYPT) { // Decryption
            _cx.init(Cipher.DECRYPT_MODE, keySpec, ivSpec) // Initialize this cipher instance

            val outputBytes = if (Build.VERSION.SDK_INT >= 26) {
                java.util.Base64.getDecoder().decode(inputByteArray)
            } else Base64.decode(inputByteArray, 0)

            val decryptedVal = _cx.doFinal(outputBytes) // Finish

            outPutByteArray = decryptedVal  // Multi-part transformation(decryption)
        }

        return outPutByteArray  // Return encrypted/decrypted string
    }


    @SuppressWarnings("kotlin:S1133","kotlin:S107","kotlin:S1874")
    @Throws(
        UnsupportedEncodingException::class,
        InvalidKeyException::class,
        InvalidAlgorithmParameterException::class,
        IllegalBlockSizeException::class,
        BadPaddingException::class)
    fun decryptFile(
        encryptionKey: String,iv: ByteArray): Cipher {

        var len = encryptionKey.toByteArray(StandardCharsets.UTF_8).size
        if (encryptionKey.toByteArray(StandardCharsets.UTF_8).size > _key.size)
            len = _key.size
        System.arraycopy(encryptionKey.toByteArray(StandardCharsets.UTF_8), 0, _key, 0, len)
        val keySpec = SecretKeySpec(_key, "AES")
        val ivSpec = IvParameterSpec(iv)

        _cx.init(Cipher.DECRYPT_MODE, keySpec, ivSpec) // Initialize this cipher instance
        return _cx  // Return decrypted cipher instance
    }

    fun decryptFile(_encryptedText: ByteArray, _key: String, _iv: String): ByteArray {
        return encryptDecryptFile(_encryptedText, _key, EncryptMode.DECRYPT, _iv)
    }

    /***
     * This function computes the SHA256 hash of input string
     *
     * @param text   Input text whose SHA256 hash has to be computed
     * @param length Length of the text to be returned
     *
     * @return returns SHA256 hash of input text
     *
     * @throws NoSuchAlgorithmException
     * @throws UnsupportedEncodingException
     */
    @Throws(NoSuchAlgorithmException::class, UnsupportedEncodingException::class)
    fun getSHA256(text: String, length: Int): String {
        val resultStr: String
        val md = MessageDigest.getInstance("SHA-256")
        md.update(text.toByteArray(StandardCharsets.UTF_8))
        val digest = md.digest()
        val result = StringBuffer()
        for (b in digest) {
            /**
             * Convert to hex
             */
            result.append(String.format("%02x", b))
        }
        resultStr = if (length > result.toString().length) {
            result.toString()
        } else {
            result.toString().substring(0, length)
        }
        return resultStr
    }

    /**
     * Encryption mode enumeration
     */
    private enum class EncryptMode {
        ENCRYPT, DECRYPT
    }

    fun getRandomString(length: Int): String {
        val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
        return (1..length)
            .map { allowedChars.random() }
            .joinToString("")
    }
}