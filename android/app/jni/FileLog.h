//
// Created by user on 19/09/23.
//

#include <string>
#ifndef NATIVEAPPVIDEOCOMPRESSION_FILELOG_H
#define NATIVEAPPVIDEOCOMPRESSION_FILELOG_H

/*#include "Defines.h"*/

class FileLog {
public:
    FileLog();
    void init(std::string path);
    static void fatal(const char *message, ...) __attribute__((format (printf, 1, 2)));
    static void e(const char *message, ...) __attribute__((format (printf, 1, 2)));
    static void w(const char *message, ...) __attribute__((format (printf, 1, 2)));
    static void d(const char *message, ...) __attribute__((format (printf, 1, 2)));
    static void ref(const char *message, ...) __attribute__((format (printf, 1, 2)));
    static void delref(const char *message, ...) __attribute__((format (printf, 1, 2)));

    static FileLog &getInstance();

private:
    FILE *logFile = nullptr;
    pthread_mutex_t mutex;
};

extern bool LOGS_ENABLED;

#define DEBUG_FATAL FileLog::getInstance().fatal
#define DEBUG_E FileLog::getInstance().e
#define DEBUG_W FileLog::getInstance().w
#define DEBUG_D FileLog::getInstance().d

#define DEBUG_REF FileLog::getInstance().ref
#define DEBUG_DELREF FileLog::getInstance().delref

#endif

