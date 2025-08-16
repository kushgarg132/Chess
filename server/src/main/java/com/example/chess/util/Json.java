package com.example.chess.util;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;

public final class Json {

    private Json() {}

    public static String toJson(Object o) {
        if (o == null) return "null";
        try (Jsonb jsonb = JsonbBuilder.create()) {
            return jsonb.toJson(o);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static <T> T fromJson(String s, Class<T> cls) throws Exception {
        if (s == null) return null;
        try (Jsonb jsonb = JsonbBuilder.create()) {
            return jsonb.fromJson(s, cls);
        }
    }
}
