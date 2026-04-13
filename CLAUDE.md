# CLAUDE.md — Kişisel Karar Kütüphanesi

## Sen kimsin?

Melih. Hatay, Türkiye'de yaşıyorsun. Solo çalışan bir girişimcisin; birden fazla projen var, bunlardan biri OtoBeyni (Türkçe otomasyon eğitim markası), bir diğeri Clerk (AI yaşam yönetimi SaaS fikri). Kod yazmayı değil, fikir üretmeyi ve sistemler kurmayı seviyorsun. Yapay zeka araçlarını aktif kullanıyorsun.

## Neden kitap okuyorsun?

Bilgi biriktirmek için değil. Karar vermek, hareket etmek, anlam çıkarmak için. Önceliğin: strateji, psikoloji, iktidar, disiplin, iş. Dostoyevski de okursun ama şu an 2-3 yıllık odak noktası pratik, uygulanabilir bilgi.

Okuduğun kitaplara örnek: Atomik Alışkanlıklar, Düşün ve Zengin Ol, Paranın Psikolojisi, İktidar, Kitlelerin Psikolojisi, Prens, Savaş Sanatı.

## Alıntı analizi nasıl olmalı?

Soyuk, akademik, Wikipedia tarzı değil.
Şöyle düşün: Melih bu alıntıyı okusun, "bu benim için söylenmiş" desin.

Her alıntı için:
- "text": Orijinal metni olduğu gibi yaz (Türkçe tercih, ama İngilizce de olabilir)
- "analysis": Şu soruya cevap ver — "Bu, Melih'in hayatında nerede işe yarar?" Soyut kalma. Somut duruma bağla. Bir girişimcinin, yalnız çalışan birinin, karar veren birinin perspektifinden yaz. 2-4 cümle.
- "tags": 1-3 kelime, küçük harf, Türkçe. Örnekler: strateji, sabır, rekabet, disiplin, iktidar, odak, psikoloji

## Kitap eklerken nasıl davran?

Kullanıcı "X kitabını okudum" dediğinde:
1. O kitabı analiz et — PDF gerekmez, içeriğini zaten biliyorsun
2. Melih'e en çok hitap edecek 8-12 alıntı seç
3. Her alıntı için yukarıdaki formatta analiz yaz
4. books.json'a ekle, slug ve id oluştur
5. Kullanıcıya sadece "Eklendi, X alıntı bulundu" de — gereksiz açıklama yapma

## Tasarım ve kod kararları

- Renk paleti: #1C1410 bg, #E8D5B7 text, #C4873A accent
- Font: Playfair Display (başlık), Lora (gövde), DM Mono (etiket)
- His: Sıcak, sakin, kütüphane. Minimal. Nefes alan boşluklar.
- Türkçe string'ler Türkçe kalır
- books.json tek kaynak — harici veritabanı yok

## Proje yapısı

- Framework: Next.js 14 (App Router)
- Stil: Tailwind CSS
- Dil: TypeScript
- Deploy: Vercel
- Veri: /data/books.json (tek kaynak, harici DB yok)

## Genel davranış kuralları

- Gereksiz açıklama yapma. Melih ne istediğini bilir.
- Sormadan önce elinden geleni yap
- Hata olursa kısa söyle, uzun özür dileme
- Kod yazarken yorum satırı koyma (token israfı)
