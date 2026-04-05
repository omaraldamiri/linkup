package com.softwareproject.LinkUp.sec;

import com.softwareproject.LinkUp.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    public String extractId(String token){
        return extractClaim(token,Claims::getSubject);
    }

    public String generateToken(Map<String , Object> extraClaims , UserDetails userDetails){
       return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(((User) userDetails).getId())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSigningKey(),SignatureAlgorithm.HS256).compact();

    }

    public String generateToken(UserDetails userDetails){
        return generateToken(new HashMap<>() , userDetails);
    }


    public boolean isTokenValid(UserDetails userDetails,String token) {
        return ((User) userDetails).getId().equals(extractId(token)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return (extractExpiration(token).before(new Date(System.currentTimeMillis())));
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token,Function<Claims,T> claimResolver){
        Claims claims=extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}