package com.mirrorfly_rn

import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.ResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PUT
import retrofit2.http.Url


class APIClient {
    private var retrofit: Retrofit? = null

    fun getClient(baseUrl:String): Retrofit? {
        val interceptor = HttpLoggingInterceptor()
        interceptor.setLevel(HttpLoggingInterceptor.Level.BODY)
        val client: OkHttpClient = OkHttpClient.Builder().addInterceptor(interceptor).build()
        retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
        return retrofit
    }
}
interface APIInterface {
    @PUT
    fun uploadBinaryData(@Url url: String?, @Body binaryData: RequestBody?): Call<ResponseBody?>?

    @GET
    fun downloadChunkFromPreAuthenticationUrl(@Url url: String?,
                                              @Header("Range") range: String): Call<ResponseBody>
}