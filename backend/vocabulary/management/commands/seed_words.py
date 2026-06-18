"""
200+ asosiy A1-A2 so'z, mantiqiy guruhlangan va vocabulary lessonlarga
biriktirilgan. Real CEFR A1-A2 darajaga yetadigan minimum.

Foydalanish:
    python manage.py seed_words
    python manage.py seed_words --reset    # avval so'zlarni o'chiradi
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import Lesson
from vocabulary.models import Word, LessonWord


# ============================================================
# A1-A2 SO'ZLAR — 200+
# Format: (word, pos, uz, ru, ipa, example_en, example_uz, cefr, freq_rank)
# ============================================================

WORDS = [
    # ========================================================
    # GREETINGS & SOCIAL (15)
    # ========================================================
    ('hello', 'interjection', 'salom', 'привет', '/həˈloʊ/',
     'Hello, how are you?', 'Salom, qalaysiz?', 'A1', 50),
    ('hi', 'interjection', 'salom', 'привет', '/haɪ/',
     'Hi, nice to meet you.', 'Salom, tanishganimdan xursandman.', 'A1', 70),
    ('goodbye', 'interjection', 'xayr', 'до свидания', '/ɡʊdˈbaɪ/',
     'Goodbye, see you tomorrow.', 'Xayr, ertaga ko\'rishamiz.', 'A1', 350),
    ('bye', 'interjection', 'xayr', 'пока', '/baɪ/',
     'Bye! Have a nice day.', 'Xayr! Yaxshi kun bo\'lsin.', 'A1', 410),
    ('please', 'adverb', 'iltimos', 'пожалуйста', '/pliːz/',
     'Please sit down.', 'Iltimos, o\'tiring.', 'A1', 200),
    ('thank you', 'phrase', 'rahmat', 'спасибо', '/ˈθæŋk juː/',
     'Thank you very much.', 'Katta rahmat.', 'A1', 100),
    ('thanks', 'interjection', 'rahmat', 'спасибо', '/θæŋks/',
     'Thanks for your help.', 'Yordamingiz uchun rahmat.', 'A1', 140),
    ('sorry', 'adjective', 'kechirasiz', 'извините', '/ˈsɒri/',
     'Sorry, I am late.', 'Kechirasiz, kech qoldim.', 'A1', 260),
    ('excuse me', 'phrase', 'kechirasiz', 'извините', '/ɪkˈskjuːz miː/',
     'Excuse me, where is the bank?', 'Kechirasiz, bank qayerda?', 'A1', 480),
    ('welcome', 'adjective', 'xush kelibsiz', 'добро пожаловать', '/ˈwɛlkəm/',
     'Welcome to our home!', 'Bizning uyimizga xush kelibsiz!', 'A1', 520),
    ('yes', 'adverb', 'ha', 'да', '/jɛs/',
     'Yes, I agree.', 'Ha, men roziman.', 'A1', 25),
    ('no', 'adverb', 'yo\'q', 'нет', '/noʊ/',
     'No, I don\'t want it.', 'Yo\'q, men buni xohlamayman.', 'A1', 30),
    ('okay', 'adverb', 'mayli', 'хорошо', '/ˌoʊˈkeɪ/',
     'Okay, let\'s go.', 'Mayli, ketdik.', 'A1', 180),
    ('name', 'noun', 'ism', 'имя', '/neɪm/',
     'My name is John.', 'Mening ismim John.', 'A1', 80),
    ('nice', 'adjective', 'yoqimli', 'приятный', '/naɪs/',
     'Nice to meet you.', 'Tanishganimdan xursandman.', 'A1', 295),

    # ========================================================
    # FAMILY & PEOPLE (20)
    # ========================================================
    ('mother', 'noun', 'ona', 'мать', '/ˈmʌðər/',
     'My mother is a teacher.', 'Mening onam o\'qituvchi.', 'A1', 150),
    ('father', 'noun', 'ota', 'отец', '/ˈfɑːðər/',
     'His father works in a bank.', 'Uning otasi bankda ishlaydi.', 'A1', 180),
    ('mom', 'noun', 'oyi', 'мама', '/mɒm/',
     'Mom, can I go out?', 'Oyi, tashqariga chiqsam bo\'ladimi?', 'A1', 280),
    ('dad', 'noun', 'dada', 'папа', '/dæd/',
     'Dad is reading a book.', 'Dadam kitob o\'qiyapti.', 'A1', 300),
    ('brother', 'noun', 'aka/uka', 'брат', '/ˈbrʌðər/',
     'I have one brother.', 'Mening bitta akam bor.', 'A1', 220),
    ('sister', 'noun', 'opa/singil', 'сестра', '/ˈsɪstər/',
     'My sister lives in London.', 'Mening opam Londonda yashaydi.', 'A1', 230),
    ('family', 'noun', 'oila', 'семья', '/ˈfæməli/',
     'We are a big family.', 'Biz katta oilamiz.', 'A1', 95),
    ('parents', 'noun', 'ota-ona', 'родители', '/ˈpɛərənts/',
     'My parents live in Tashkent.', 'Mening ota-onam Toshkentda yashaydi.', 'A1', 340),
    ('son', 'noun', 'o\'g\'il', 'сын', '/sʌn/',
     'They have one son.', 'Ularning bitta o\'g\'illari bor.', 'A1', 390),
    ('daughter', 'noun', 'qiz', 'дочь', '/ˈdɔːtər/',
     'My daughter is five years old.', 'Mening qizim besh yoshda.', 'A1', 420),
    ('child', 'noun', 'bola', 'ребёнок', '/tʃaɪld/',
     'The child is playing.', 'Bola o\'ynayapti.', 'A1', 130),
    ('children', 'noun', 'bolalar', 'дети', '/ˈtʃɪldrən/',
     'They have three children.', 'Ularning uchta bolasi bor.', 'A1', 160),
    ('baby', 'noun', 'chaqaloq', 'малыш', '/ˈbeɪbi/',
     'The baby is sleeping.', 'Chaqaloq uxlayapti.', 'A1', 380),
    ('friend', 'noun', 'do\'st', 'друг', '/frɛnd/',
     'He is my best friend.', 'U mening eng yaxshi do\'stim.', 'A1', 105),
    ('man', 'noun', 'erkak', 'мужчина', '/mæn/',
     'That man is my teacher.', 'Anavi erkak mening o\'qituvchim.', 'A1', 75),
    ('woman', 'noun', 'ayol', 'женщина', '/ˈwʊmən/',
     'The woman is reading.', 'Ayol o\'qiyapti.', 'A1', 85),
    ('boy', 'noun', 'o\'g\'il bola', 'мальчик', '/bɔɪ/',
     'The boy is running.', 'O\'g\'il bola yuguryapti.', 'A1', 170),
    ('girl', 'noun', 'qiz bola', 'девочка', '/ɡɜːrl/',
     'The girl is singing.', 'Qiz bola qo\'shiq aytmoqda.', 'A1', 175),
    ('people', 'noun', 'odamlar', 'люди', '/ˈpiːpəl/',
     'Many people live here.', 'Bu yerda ko\'p odamlar yashaydi.', 'A1', 90),
    ('person', 'noun', 'odam', 'человек', '/ˈpɜːrsən/',
     'He is a kind person.', 'U yaxshi odam.', 'A1', 100),

    # ========================================================
    # NUMBERS (15)
    # ========================================================
    ('one', 'noun', 'bir', 'один', '/wʌn/',
     'I have one cat.', 'Mening bitta mushugim bor.', 'A1', 40),
    ('two', 'noun', 'ikki', 'два', '/tuː/',
     'Two coffees, please.', 'Ikkita qahva, iltimos.', 'A1', 60),
    ('three', 'noun', 'uch', 'три', '/θriː/',
     'I have three books.', 'Mening uchta kitobim bor.', 'A1', 110),
    ('four', 'noun', 'to\'rt', 'четыре', '/fɔːr/',
     'Four people are waiting.', 'To\'rt kishi kutmoqda.', 'A1', 165),
    ('five', 'noun', 'besh', 'пять', '/faɪv/',
     'Five o\'clock in the evening.', 'Kechki soat besh.', 'A1', 195),
    ('six', 'noun', 'olti', 'шесть', '/sɪks/',
     'Six students are in class.', 'Sinfda olti o\'quvchi.', 'A1', 235),
    ('seven', 'noun', 'yetti', 'семь', '/ˈsɛvən/',
     'Seven days in a week.', 'Bir haftada yetti kun.', 'A1', 250),
    ('eight', 'noun', 'sakkiz', 'восемь', '/eɪt/',
     'I wake up at eight.', 'Men sakkizda uyg\'onaman.', 'A1', 290),
    ('nine', 'noun', 'to\'qqiz', 'девять', '/naɪn/',
     'Nine apples are on the table.', 'Stol ustida to\'qqiz olma.', 'A1', 330),
    ('ten', 'noun', 'o\'n', 'десять', '/tɛn/',
     'Ten years is a long time.', 'O\'n yil uzoq vaqt.', 'A1', 155),
    ('hundred', 'noun', 'yuz', 'сто', '/ˈhʌndrəd/',
     'A hundred people came.', 'Yuz kishi keldi.', 'A1', 305),
    ('thousand', 'noun', 'ming', 'тысяча', '/ˈθaʊzənd/',
     'One thousand dollars.', 'Bir ming dollar.', 'A1', 295),
    ('number', 'noun', 'raqam', 'число', '/ˈnʌmbər/',
     'What is your phone number?', 'Telefon raqamingiz qanday?', 'A1', 125),
    ('first', 'adjective', 'birinchi', 'первый', '/fɜːrst/',
     'This is my first lesson.', 'Bu mening birinchi darsim.', 'A1', 115),
    ('last', 'adjective', 'oxirgi', 'последний', '/læst/',
     'This is the last page.', 'Bu oxirgi sahifa.', 'A1', 135),

    # ========================================================
    # TIME (20)
    # ========================================================
    ('time', 'noun', 'vaqt', 'время', '/taɪm/',
     'What time is it?', 'Soat necha?', 'A1', 70),
    ('hour', 'noun', 'soat', 'час', '/ˈaʊər/',
     'I work eight hours a day.', 'Men kuniga sakkiz soat ishlayman.', 'A1', 245),
    ('minute', 'noun', 'daqiqa', 'минута', '/ˈmɪnɪt/',
     'Wait a minute, please.', 'Bir daqiqa kuting, iltimos.', 'A1', 270),
    ('day', 'noun', 'kun', 'день', '/deɪ/',
     'Have a nice day!', 'Yaxshi kun bo\'lsin!', 'A1', 110),
    ('week', 'noun', 'hafta', 'неделя', '/wiːk/',
     'See you next week.', 'Keyingi haftagacha.', 'A1', 290),
    ('month', 'noun', 'oy', 'месяц', '/mʌnθ/',
     'This month is busy.', 'Bu oy band.', 'A1', 270),
    ('year', 'noun', 'yil', 'год', '/jɪər/',
     'Happy New Year!', 'Yangi yil muborak!', 'A1', 120),
    ('morning', 'noun', 'ertalab', 'утро', '/ˈmɔːrnɪŋ/',
     'Good morning!', 'Xayrli tong!', 'A1', 230),
    ('afternoon', 'noun', 'tushdan keyin', 'день', '/ˌæftərˈnuːn/',
     'See you this afternoon.', 'Bugun tushdan keyin ko\'rishamiz.', 'A1', 360),
    ('evening', 'noun', 'kechqurun', 'вечер', '/ˈiːvnɪŋ/',
     'I read in the evening.', 'Men kechqurun o\'qiyman.', 'A1', 310),
    ('night', 'noun', 'tun', 'ночь', '/naɪt/',
     'Good night!', 'Xayrli tun!', 'A1', 205),
    ('today', 'adverb', 'bugun', 'сегодня', '/təˈdeɪ/',
     'It is hot today.', 'Bugun issiq.', 'A1', 88),
    ('tomorrow', 'adverb', 'ertaga', 'завтра', '/təˈmɒroʊ/',
     'See you tomorrow.', 'Ertaga ko\'rishamiz.', 'A1', 215),
    ('yesterday', 'adverb', 'kecha', 'вчера', '/ˈjɛstərdeɪ/',
     'Yesterday was Sunday.', 'Kecha yakshanba edi.', 'A1', 285),
    ('now', 'adverb', 'hozir', 'сейчас', '/naʊ/',
     'I am busy now.', 'Men hozir bandman.', 'A1', 65),
    ('Monday', 'noun', 'dushanba', 'понедельник', '/ˈmʌndeɪ/',
     'On Monday I work.', 'Dushanba kuni men ishlayman.', 'A1', 460),
    ('Friday', 'noun', 'juma', 'пятница', '/ˈfraɪdeɪ/',
     'Friday is my favorite day.', 'Juma — sevimli kunim.', 'A1', 470),
    ('Sunday', 'noun', 'yakshanba', 'воскресенье', '/ˈsʌndeɪ/',
     'On Sunday we rest.', 'Yakshanbada biz dam olamiz.', 'A1', 450),
    ('weekend', 'noun', 'dam olish kunlari', 'выходные', '/ˈwiːkˌɛnd/',
     'I love weekends.', 'Men dam olish kunlarini yaxshi ko\'raman.', 'A1', 380),
    ('early', 'adverb', 'erta', 'рано', '/ˈɜːrli/',
     'I wake up early.', 'Men erta uyg\'onaman.', 'A1', 320),

    # ========================================================
    # FOOD & DRINK (25)
    # ========================================================
    ('water', 'noun', 'suv', 'вода', '/ˈwɔːtər/',
     'A glass of water, please.', 'Bir stakan suv, iltimos.', 'A1', 250),
    ('bread', 'noun', 'non', 'хлеб', '/brɛd/',
     'Bread is on the table.', 'Non stol ustida.', 'A1', 540),
    ('coffee', 'noun', 'qahva', 'кофе', '/ˈkɒfi/',
     'I drink coffee in the morning.', 'Men ertalab qahva ichaman.', 'A1', 360),
    ('tea', 'noun', 'choy', 'чай', '/tiː/',
     'Would you like tea?', 'Choy xohlaysizmi?', 'A1', 450),
    ('milk', 'noun', 'sut', 'молоко', '/mɪlk/',
     'I drink milk every day.', 'Men har kuni sut ichaman.', 'A1', 490),
    ('juice', 'noun', 'sok', 'сок', '/dʒuːs/',
     'Orange juice is healthy.', 'Apelsin soki foydali.', 'A1', 580),
    ('food', 'noun', 'ovqat', 'еда', '/fuːd/',
     'The food is delicious.', 'Ovqat juda mazali.', 'A1', 195),
    ('breakfast', 'noun', 'nonushta', 'завтрак', '/ˈbrɛkfəst/',
     'I have breakfast at 8.', 'Men 8 da nonushta qilaman.', 'A1', 460),
    ('lunch', 'noun', 'tushlik', 'обед', '/lʌntʃ/',
     'Lunch is ready.', 'Tushlik tayyor.', 'A1', 510),
    ('dinner', 'noun', 'kechki ovqat', 'ужин', '/ˈdɪnər/',
     'We have dinner together.', 'Biz birga kechki ovqat qilamiz.', 'A1', 440),
    ('apple', 'noun', 'olma', 'яблоко', '/ˈæpəl/',
     'An apple a day keeps the doctor away.', 'Kuniga bir olma — sog\'lik kafolati.', 'A1', 550),
    ('banana', 'noun', 'banan', 'банан', '/bəˈnænə/',
     'Bananas are yellow.', 'Bananlar sariq.', 'A1', 620),
    ('rice', 'noun', 'guruch', 'рис', '/raɪs/',
     'Rice is a popular food.', 'Guruch mashhur taom.', 'A1', 595),
    ('meat', 'noun', 'go\'sht', 'мясо', '/miːt/',
     'I don\'t eat meat.', 'Men go\'sht yemayman.', 'A1', 530),
    ('chicken', 'noun', 'tovuq', 'курица', '/ˈtʃɪkɪn/',
     'Chicken soup is delicious.', 'Tovuq sho\'rva mazali.', 'A1', 555),
    ('fish', 'noun', 'baliq', 'рыба', '/fɪʃ/',
     'Fish lives in water.', 'Baliq suvda yashaydi.', 'A1', 390),
    ('egg', 'noun', 'tuxum', 'яйцо', '/ɛɡ/',
     'I eat two eggs for breakfast.', 'Nonushtada ikkita tuxum yeyman.', 'A1', 405),
    ('cheese', 'noun', 'pishloq', 'сыр', '/tʃiːz/',
     'I love cheese.', 'Men pishloqni yaxshi ko\'raman.', 'A1', 615),
    ('sugar', 'noun', 'shakar', 'сахар', '/ˈʃʊɡər/',
     'No sugar, please.', 'Shakarsiz, iltimos.', 'A1', 510),
    ('salt', 'noun', 'tuz', 'соль', '/sɔːlt/',
     'Pass the salt, please.', 'Tuzni uzating, iltimos.', 'A1', 525),
    ('vegetable', 'noun', 'sabzavot', 'овощ', '/ˈvɛdʒtəbəl/',
     'Vegetables are healthy.', 'Sabzavotlar foydali.', 'A1', 540),
    ('fruit', 'noun', 'meva', 'фрукт', '/fruːt/',
     'I eat fruit every day.', 'Men har kuni meva yeyman.', 'A1', 480),
    ('eat', 'verb', 'yemoq', 'есть', '/iːt/',
     'I eat breakfast at 8.', 'Men 8 da nonushta qilaman.', 'A1', 320),
    ('drink', 'verb', 'ichmoq', 'пить', '/drɪŋk/',
     'I drink tea every morning.', 'Men har kuni ertalab choy ichaman.', 'A1', 410),
    ('cook', 'verb', 'pishirmoq', 'готовить', '/kʊk/',
     'My mom cooks well.', 'Onam yaxshi pishiradi.', 'A1', 425),

    # ========================================================
    # HOME & ROOMS (15)
    # ========================================================
    ('home', 'noun', 'uy', 'дом', '/hoʊm/',
     'I am at home.', 'Men uydaman.', 'A1', 75),
    ('house', 'noun', 'uy', 'дом', '/haʊs/',
     'My house is small.', 'Mening uyim kichik.', 'A1', 95),
    ('room', 'noun', 'xona', 'комната', '/ruːm/',
     'My room is clean.', 'Mening xonam toza.', 'A1', 185),
    ('kitchen', 'noun', 'oshxona', 'кухня', '/ˈkɪtʃən/',
     'Mom is in the kitchen.', 'Oyim oshxonada.', 'A1', 365),
    ('bedroom', 'noun', 'yotoqxona', 'спальня', '/ˈbɛdˌruːm/',
     'My bedroom is upstairs.', 'Yotoqxonam yuqorida.', 'A1', 510),
    ('bathroom', 'noun', 'hammom', 'ванная', '/ˈbæθˌruːm/',
     'The bathroom is on the right.', 'Hammom o\'ng tomonda.', 'A1', 475),
    ('door', 'noun', 'eshik', 'дверь', '/dɔːr/',
     'Please close the door.', 'Iltimos, eshikni yoping.', 'A1', 145),
    ('window', 'noun', 'deraza', 'окно', '/ˈwɪndoʊ/',
     'Open the window, please.', 'Derazani oching, iltimos.', 'A1', 210),
    ('table', 'noun', 'stol', 'стол', '/ˈteɪbəl/',
     'Put the book on the table.', 'Kitobni stol ustiga qo\'ying.', 'A1', 235),
    ('chair', 'noun', 'stul', 'стул', '/tʃɛər/',
     'Sit on the chair.', 'Stulga o\'tiring.', 'A1', 285),
    ('bed', 'noun', 'krovat', 'кровать', '/bɛd/',
     'I go to bed at 10.', 'Men 10 da yotaman.', 'A1', 195),
    ('floor', 'noun', 'pol', 'пол', '/flɔːr/',
     'The cat is on the floor.', 'Mushuk polda.', 'A1', 215),
    ('wall', 'noun', 'devor', 'стена', '/wɔːl/',
     'A picture is on the wall.', 'Devorda rasm bor.', 'A1', 260),
    ('light', 'noun', 'chiroq', 'свет', '/laɪt/',
     'Turn on the light.', 'Chiroqni yoqing.', 'A1', 175),
    ('TV', 'noun', 'televizor', 'телевизор', '/ˌtiːˈviː/',
     'I watch TV in the evening.', 'Kechqurun televizor ko\'raman.', 'A1', 240),

    # ========================================================
    # CLOTHES & BODY (15)
    # ========================================================
    ('shirt', 'noun', 'ko\'ylak', 'рубашка', '/ʃɜːrt/',
     'He wears a white shirt.', 'U oq ko\'ylak kiygan.', 'A1', 475),
    ('trousers', 'noun', 'shim', 'брюки', '/ˈtraʊzərz/',
     'These trousers are too long.', 'Bu shim juda uzun.', 'A1', 580),
    ('shoes', 'noun', 'tufli', 'обувь', '/ʃuːz/',
     'My shoes are dirty.', 'Mening tuflilarim iflos.', 'A1', 350),
    ('hat', 'noun', 'shapka', 'шляпа', '/hæt/',
     'I wear a hat in winter.', 'Qishda shapka kiyaman.', 'A1', 425),
    ('coat', 'noun', 'palto', 'пальто', '/koʊt/',
     'My coat is warm.', 'Mening paltom issiq.', 'A1', 495),
    ('clothes', 'noun', 'kiyim', 'одежда', '/kloʊðz/',
     'I buy new clothes.', 'Men yangi kiyim sotib olaman.', 'A1', 290),
    ('hand', 'noun', 'qo\'l', 'рука', '/hænd/',
     'Wash your hands!', 'Qo\'llaringizni yuving!', 'A1', 165),
    ('foot', 'noun', 'oyoq', 'нога', '/fʊt/',
     'My foot hurts.', 'Oyog\'im og\'riyapti.', 'A1', 220),
    ('eye', 'noun', 'ko\'z', 'глаз', '/aɪ/',
     'She has blue eyes.', 'Uning ko\'zlari ko\'k.', 'A1', 155),
    ('head', 'noun', 'bosh', 'голова', '/hɛd/',
     'I have a headache.', 'Boshim og\'riyapti.', 'A1', 125),
    ('face', 'noun', 'yuz', 'лицо', '/feɪs/',
     'Wash your face.', 'Yuzingizni yuving.', 'A1', 250),
    ('hair', 'noun', 'soch', 'волосы', '/hɛər/',
     'She has long hair.', 'Uning sochi uzun.', 'A1', 270),
    ('mouth', 'noun', 'og\'iz', 'рот', '/maʊθ/',
     'Open your mouth.', 'Og\'zingizni oching.', 'A1', 305),
    ('nose', 'noun', 'burun', 'нос', '/noʊz/',
     'I have a runny nose.', 'Mening burnimdan oqyapti.', 'A1', 365),
    ('ear', 'noun', 'quloq', 'ухо', '/ɪər/',
     'My ear hurts.', 'Qulog\'im og\'riyapti.', 'A1', 410),

    # ========================================================
    # SCHOOL & CLASSROOM (15)
    # ========================================================
    ('school', 'noun', 'maktab', 'школа', '/skuːl/',
     'My school is big.', 'Mening maktabim katta.', 'A1', 105),
    ('book', 'noun', 'kitob', 'книга', '/bʊk/',
     'I read a good book.', 'Men yaxshi kitob o\'qiyman.', 'A1', 85),
    ('pen', 'noun', 'ruchka', 'ручка', '/pɛn/',
     'I write with a pen.', 'Men ruchka bilan yozaman.', 'A1', 360),
    ('pencil', 'noun', 'qalam', 'карандаш', '/ˈpɛnsəl/',
     'Use a pencil for drawing.', 'Chizish uchun qalam ishlating.', 'A1', 470),
    ('paper', 'noun', 'qog\'oz', 'бумага', '/ˈpeɪpər/',
     'I need a piece of paper.', 'Menga qog\'oz kerak.', 'A1', 215),
    ('teacher', 'noun', 'o\'qituvchi', 'учитель', '/ˈtiːtʃər/',
     'My teacher is kind.', 'Mening o\'qituvchim mehribon.', 'A1', 195),
    ('student', 'noun', 'o\'quvchi', 'студент', '/ˈstuːdənt/',
     'I am a student.', 'Men o\'quvchiman.', 'A1', 175),
    ('class', 'noun', 'sinf', 'класс', '/klæs/',
     'My class starts at 9.', 'Sinfim 9 da boshlanadi.', 'A1', 230),
    ('lesson', 'noun', 'dars', 'урок', '/ˈlɛsən/',
     'The lesson is interesting.', 'Dars qiziqarli.', 'A1', 320),
    ('homework', 'noun', 'uy vazifasi', 'домашнее задание', '/ˈhoʊmˌwɜːrk/',
     'Do your homework.', 'Uy vazifangizni bajaring.', 'A1', 480),
    ('English', 'noun', 'ingliz tili', 'английский', '/ˈɪŋɡlɪʃ/',
     'I study English.', 'Men ingliz tilini o\'rganaman.', 'A1', 105),
    ('word', 'noun', 'so\'z', 'слово', '/wɜːrd/',
     'This word is new.', 'Bu so\'z yangi.', 'A1', 130),
    ('question', 'noun', 'savol', 'вопрос', '/ˈkwɛstʃən/',
     'I have a question.', 'Menda savol bor.', 'A1', 165),
    ('answer', 'noun', 'javob', 'ответ', '/ˈænsər/',
     'What is the answer?', 'Javob nima?', 'A1', 225),
    ('study', 'verb', 'o\'qimoq', 'учиться', '/ˈstʌdi/',
     'She studies English.', 'U ingliz tilini o\'qiydi.', 'A1', 380),

    # ========================================================
    # PLACES & TRAVEL (15)
    # ========================================================
    ('city', 'noun', 'shahar', 'город', '/ˈsɪti/',
     'Tashkent is a big city.', 'Toshkent katta shahar.', 'A1', 145),
    ('country', 'noun', 'mamlakat', 'страна', '/ˈkʌntri/',
     'Uzbekistan is my country.', 'O\'zbekiston mening mamlakatim.', 'A1', 175),
    ('street', 'noun', 'ko\'cha', 'улица', '/striːt/',
     'I live on this street.', 'Men bu ko\'chada yashayman.', 'A1', 200),
    ('shop', 'noun', 'do\'kon', 'магазин', '/ʃɒp/',
     'The shop is open.', 'Do\'kon ochiq.', 'A1', 260),
    ('store', 'noun', 'magazin', 'магазин', '/stɔːr/',
     'I go to the store.', 'Men magazinga boraman.', 'A1', 285),
    ('hospital', 'noun', 'shifoxona', 'больница', '/ˈhɒspɪtəl/',
     'She works at a hospital.', 'U shifoxonada ishlaydi.', 'A1', 305),
    ('bank', 'noun', 'bank', 'банк', '/bæŋk/',
     'The bank is closed today.', 'Bank bugun yopiq.', 'A1', 295),
    ('restaurant', 'noun', 'restoran', 'ресторан', '/ˈrɛstərənt/',
     'Let\'s go to a restaurant.', 'Restoranga boraylik.', 'A1', 335),
    ('hotel', 'noun', 'mehmonxona', 'отель', '/hoʊˈtɛl/',
     'We stay at a hotel.', 'Biz mehmonxonada qolamiz.', 'A1', 370),
    ('airport', 'noun', 'aeroport', 'аэропорт', '/ˈɛərˌpɔːrt/',
     'The airport is big.', 'Aeroport katta.', 'A1', 415),
    ('station', 'noun', 'bekat', 'станция', '/ˈsteɪʃən/',
     'I wait at the bus station.', 'Avtobus bekatida kutaman.', 'A1', 445),
    ('park', 'noun', 'park', 'парк', '/pɑːrk/',
     'We walk in the park.', 'Biz parkda sayr qilamiz.', 'A1', 265),
    ('road', 'noun', 'yo\'l', 'дорога', '/roʊd/',
     'The road is long.', 'Yo\'l uzun.', 'A1', 225),
    ('car', 'noun', 'mashina', 'машина', '/kɑːr/',
     'I drive a car.', 'Men mashina haydayman.', 'A1', 135),
    ('bus', 'noun', 'avtobus', 'автобус', '/bʌs/',
     'I take the bus to work.', 'Men ishga avtobusda boraman.', 'A1', 275),

    # ========================================================
    # COLORS & DESCRIPTORS (15)
    # ========================================================
    ('white', 'adjective', 'oq', 'белый', '/waɪt/',
     'The wall is white.', 'Devor oq.', 'A1', 240),
    ('black', 'adjective', 'qora', 'чёрный', '/blæk/',
     'My cat is black.', 'Mening mushugim qora.', 'A1', 190),
    ('red', 'adjective', 'qizil', 'красный', '/rɛd/',
     'I have a red car.', 'Mening qizil mashinam bor.', 'A1', 310),
    ('blue', 'adjective', 'ko\'k', 'синий', '/bluː/',
     'The sky is blue.', 'Osmon ko\'k.', 'A1', 295),
    ('green', 'adjective', 'yashil', 'зелёный', '/ɡriːn/',
     'Grass is green.', 'O\'t yashil.', 'A1', 290),
    ('yellow', 'adjective', 'sariq', 'жёлтый', '/ˈjɛloʊ/',
     'The sun is yellow.', 'Quyosh sariq.', 'A1', 400),
    ('big', 'adjective', 'katta', 'большой', '/bɪɡ/',
     'This is a big house.', 'Bu katta uy.', 'A1', 115),
    ('small', 'adjective', 'kichik', 'маленький', '/smɔːl/',
     'I have a small dog.', 'Mening kichik itim bor.', 'A1', 165),
    ('new', 'adjective', 'yangi', 'новый', '/njuː/',
     'I bought a new phone.', 'Men yangi telefon sotib oldim.', 'A1', 65),
    ('old', 'adjective', 'eski/qari', 'старый', '/oʊld/',
     'This is an old book.', 'Bu eski kitob.', 'A1', 155),
    ('good', 'adjective', 'yaxshi', 'хороший', '/ɡʊd/',
     'This is a good idea.', 'Bu yaxshi fikr.', 'A1', 55),
    ('bad', 'adjective', 'yomon', 'плохой', '/bæd/',
     'It is a bad day.', 'Yomon kun.', 'A1', 280),
    ('hot', 'adjective', 'issiq', 'горячий', '/hɒt/',
     'The tea is hot.', 'Choy issiq.', 'A1', 235),
    ('cold', 'adjective', 'sovuq', 'холодный', '/koʊld/',
     'It is cold today.', 'Bugun sovuq.', 'A1', 245),
    ('happy', 'adjective', 'baxtli', 'счастливый', '/ˈhæpi/',
     'I am happy today.', 'Men bugun baxtliman.', 'A1', 470),

    # ========================================================
    # BASIC VERBS (30)
    # ========================================================
    ('be', 'verb', 'bo\'lmoq', 'быть', '/biː/',
     'I am a student.', 'Men talabaman.', 'A1', 10),
    ('have', 'verb', 'ega bo\'lmoq', 'иметь', '/hæv/',
     'I have a dog.', 'Mening itim bor.', 'A1', 35),
    ('go', 'verb', 'bormoq', 'идти', '/ɡoʊ/',
     'I go to school.', 'Men maktabga boraman.', 'A1', 45),
    ('come', 'verb', 'kelmoq', 'приходить', '/kʌm/',
     'Come here, please.', 'Bu yerga keling, iltimos.', 'A1', 85),
    ('want', 'verb', 'xohlamoq', 'хотеть', '/wɒnt/',
     'I want some water.', 'Men suv xohlayman.', 'A1', 130),
    ('like', 'verb', 'yoqmoq', 'нравиться', '/laɪk/',
     'I like coffee.', 'Menga qahva yoqadi.', 'A1', 90),
    ('love', 'verb', 'sevmoq', 'любить', '/lʌv/',
     'I love my family.', 'Men oilamni sevaman.', 'A1', 120),
    ('work', 'verb', 'ishlamoq', 'работать', '/wɜːrk/',
     'I work in Tashkent.', 'Men Toshkentda ishlayman.', 'A1', 140),
    ('live', 'verb', 'yashamoq', 'жить', '/lɪv/',
     'I live in a small city.', 'Men kichik shaharda yashayman.', 'A1', 150),
    ('see', 'verb', 'ko\'rmoq', 'видеть', '/siː/',
     'I see a bird.', 'Men qush ko\'ryapman.', 'A1', 75),
    ('look', 'verb', 'qaramoq', 'смотреть', '/lʊk/',
     'Look at this picture.', 'Bu rasmga qarang.', 'A1', 115),
    ('hear', 'verb', 'eshitmoq', 'слышать', '/hɪər/',
     'I hear music.', 'Men musiqa eshityapman.', 'A1', 195),
    ('say', 'verb', 'aytmoq', 'сказать', '/seɪ/',
     'What did you say?', 'Nima dedingiz?', 'A1', 70),
    ('tell', 'verb', 'aytib bermoq', 'рассказать', '/tɛl/',
     'Tell me about your day.', 'Kuningiz haqida ayting.', 'A1', 110),
    ('speak', 'verb', 'gapirmoq', 'говорить', '/spiːk/',
     'I speak English.', 'Men inglizcha gapiraman.', 'A1', 185),
    ('talk', 'verb', 'so\'zlashmoq', 'разговаривать', '/tɔːk/',
     'We talk every day.', 'Biz har kuni gaplashamiz.', 'A1', 165),
    ('read', 'verb', 'o\'qimoq', 'читать', '/riːd/',
     'I read books at night.', 'Men kechqurun kitob o\'qiyman.', 'A1', 220),
    ('write', 'verb', 'yozmoq', 'писать', '/raɪt/',
     'Write your name here.', 'Ismingizni shu yerga yozing.', 'A1', 240),
    ('know', 'verb', 'bilmoq', 'знать', '/noʊ/',
     'I know him.', 'Men uni bilaman.', 'A1', 50),
    ('think', 'verb', 'o\'ylamoq', 'думать', '/θɪŋk/',
     'I think you are right.', 'Sizning haqligingizni o\'ylayman.', 'A1', 105),
    ('make', 'verb', 'qilmoq', 'делать', '/meɪk/',
     'I make breakfast.', 'Men nonushta tayyorlayman.', 'A1', 95),
    ('do', 'verb', 'qilmoq', 'делать', '/duː/',
     'What do you do?', 'Siz nima qilasiz?', 'A1', 20),
    ('get', 'verb', 'olmoq', 'получать', '/ɡɛt/',
     'I get up at 7.', 'Men 7 da turaman.', 'A1', 80),
    ('give', 'verb', 'bermoq', 'давать', '/ɡɪv/',
     'Give me the book.', 'Kitobni bering.', 'A1', 100),
    ('take', 'verb', 'olmoq', 'брать', '/teɪk/',
     'Take this pen.', 'Mana shu ruchkani oling.', 'A1', 90),
    ('open', 'verb', 'ochmoq', 'открывать', '/ˈoʊpən/',
     'Open the window.', 'Derazani oching.', 'A1', 210),
    ('close', 'verb', 'yopmoq', 'закрывать', '/kloʊz/',
     'Close the door.', 'Eshikni yoping.', 'A1', 290),
    ('sleep', 'verb', 'uxlamoq', 'спать', '/sliːp/',
     'I sleep 8 hours.', 'Men 8 soat uxlayman.', 'A1', 280),
    ('wake up', 'verb', 'uyg\'onmoq', 'просыпаться', '/weɪk ʌp/',
     'I wake up at 7.', 'Men 7 da uyg\'onaman.', 'A1', 360),
    ('learn', 'verb', 'o\'rganmoq', 'учить', '/lɜːrn/',
     'I learn new words.', 'Men yangi so\'zlarni o\'rganaman.', 'A1', 215),

    # ========================================================
    # COMMON OBJECTS (15)
    # ========================================================
    ('phone', 'noun', 'telefon', 'телефон', '/foʊn/',
     'My phone is new.', 'Mening telefonim yangi.', 'A1', 195),
    ('computer', 'noun', 'kompyuter', 'компьютер', '/kəmˈpjuːtər/',
     'I use a computer at work.', 'Ishda kompyuterdan foydalanaman.', 'A1', 260),
    ('bag', 'noun', 'sumka', 'сумка', '/bæɡ/',
     'My bag is heavy.', 'Mening sumkam og\'ir.', 'A1', 345),
    ('key', 'noun', 'kalit', 'ключ', '/kiː/',
     'Where are my keys?', 'Kalitlarim qayerda?', 'A1', 295),
    ('money', 'noun', 'pul', 'деньги', '/ˈmʌni/',
     'I need more money.', 'Menga ko\'proq pul kerak.', 'A1', 170),
    ('cat', 'noun', 'mushuk', 'кошка', '/kæt/',
     'My cat is sleeping.', 'Mushugim uxlayapti.', 'A1', 310),
    ('dog', 'noun', 'it', 'собака', '/dɒɡ/',
     'My dog is friendly.', 'Mening itim do\'stona.', 'A1', 245),
    ('bird', 'noun', 'qush', 'птица', '/bɜːrd/',
     'A bird is singing.', 'Qush sayraydi.', 'A1', 415),
    ('tree', 'noun', 'daraxt', 'дерево', '/triː/',
     'The tree is tall.', 'Daraxt baland.', 'A1', 260),
    ('flower', 'noun', 'gul', 'цветок', '/ˈflaʊər/',
     'Flowers are beautiful.', 'Gullar chiroyli.', 'A1', 410),
    ('sun', 'noun', 'quyosh', 'солнце', '/sʌn/',
     'The sun is bright.', 'Quyosh yorqin.', 'A1', 195),
    ('moon', 'noun', 'oy', 'луна', '/muːn/',
     'The moon is full tonight.', 'Bugun to\'lin oy.', 'A1', 360),
    ('rain', 'noun', 'yomg\'ir', 'дождь', '/reɪn/',
     'It is raining.', 'Yomg\'ir yog\'yapti.', 'A1', 305),
    ('snow', 'noun', 'qor', 'снег', '/snoʊ/',
     'Snow is white and cold.', 'Qor oq va sovuq.', 'A1', 345),
    ('weather', 'noun', 'ob-havo', 'погода', '/ˈwɛðər/',
     'The weather is nice today.', 'Bugun ob-havo yaxshi.', 'A1', 285),

    # ========================================================
    # FEELINGS & STATES (10) — A2 darajadagilar
    # ========================================================
    ('tired', 'adjective', 'charchagan', 'усталый', '/ˈtaɪərd/',
     'I am tired after work.', 'Ishdan keyin charchaganman.', 'A2', 425),
    ('hungry', 'adjective', 'och', 'голодный', '/ˈhʌŋɡri/',
     'I am very hungry.', 'Men juda ochman.', 'A2', 455),
    ('thirsty', 'adjective', 'chanqagan', 'жаждущий', '/ˈθɜːrsti/',
     'I am thirsty after running.', 'Yugurish ortidan chanqaganman.', 'A2', 610),
    ('sad', 'adjective', 'g\'amgin', 'грустный', '/sæd/',
     'She looks sad.', 'U g\'amgin ko\'rinadi.', 'A2', 720),
    ('angry', 'adjective', 'jahli chiqqan', 'сердитый', '/ˈæŋɡri/',
     'Don\'t be angry with me.', 'Menga jahlingiz chiqmasin.', 'A2', 540),
    ('sick', 'adjective', 'kasal', 'больной', '/sɪk/',
     'My son is sick today.', 'O\'g\'lim bugun kasal.', 'A2', 510),
    ('busy', 'adjective', 'band', 'занятый', '/ˈbɪzi/',
     'I am busy now.', 'Men hozir bandman.', 'A2', 350),
    ('free', 'adjective', 'bo\'sh', 'свободный', '/friː/',
     'I am free on Sunday.', 'Yakshanbada bo\'shman.', 'A2', 320),
    ('beautiful', 'adjective', 'chiroyli', 'красивый', '/ˈbjuːtəfəl/',
     'What a beautiful flower!', 'Qanday chiroyli gul!', 'A2', 285),
    ('interesting', 'adjective', 'qiziqarli', 'интересный', '/ˈɪntrəstɪŋ/',
     'This book is interesting.', 'Bu kitob qiziqarli.', 'A2', 295),
]


# ============================================================
# LESSON-WORD MAPPING — kengaytirilgan
# Format: lesson title (partial) → [word list]
# ============================================================

LESSON_WORD_MAP = {
    # Greetings
    'Hello and Hi': ['hello', 'hi', 'goodbye', 'bye', 'name', 'nice'],
    'Saying Hello': ['hello', 'hi', 'goodbye', 'bye', 'thank you', 'thanks',
                     'please', 'sorry', 'excuse me', 'welcome', 'yes', 'no'],
    'Asking names': ['name', 'hello', 'nice'],
    'My name is...': ['name', 'hello', 'nice'],

    # Family
    'Family members': ['mother', 'father', 'mom', 'dad', 'brother', 'sister',
                       'family', 'parents', 'son', 'daughter', 'child', 'children',
                       'baby'],

    # Numbers / time
    'Numbers 1-100': ['one', 'two', 'three', 'four', 'five', 'six', 'seven',
                      'eight', 'nine', 'ten', 'hundred', 'thousand', 'number',
                      'first', 'last'],
    'Time and schedule': ['time', 'hour', 'minute', 'day', 'week', 'month',
                          'year', 'morning', 'afternoon', 'evening', 'night',
                          'now', 'today', 'tomorrow', 'yesterday'],
    'Morning routine': ['wake up', 'eat', 'drink', 'go', 'work', 'study',
                        'breakfast', 'morning'],
    'Weekend activities': ['weekend', 'Sunday', 'Friday', 'free', 'park',
                           'restaurant', 'cook'],

    # Food
    'Food vocabulary': ['water', 'bread', 'coffee', 'tea', 'food', 'milk',
                        'juice', 'apple', 'banana', 'rice', 'meat', 'chicken',
                        'fish', 'egg', 'cheese', 'sugar', 'salt', 'vegetable',
                        'fruit', 'breakfast', 'lunch', 'dinner'],
    'Ordering at a cafe': ['water', 'coffee', 'tea', 'juice', 'please', 'thank you',
                           'sugar', 'milk'],
    'At the supermarket': ['bread', 'water', 'food', 'milk', 'cheese',
                           'fruit', 'vegetable', 'meat', 'money'],

    # Colors
    'Colors and shapes': ['white', 'black', 'red', 'blue', 'green', 'yellow',
                          'big', 'small'],

    # Verbs
    'Action verbs': ['go', 'come', 'eat', 'drink', 'want', 'like', 'work',
                     'study', 'see', 'look', 'hear', 'say', 'tell', 'speak',
                     'talk', 'read', 'write', 'know', 'think', 'make', 'do',
                     'get', 'give', 'take', 'open', 'close', 'sleep',
                     'wake up', 'learn', 'live', 'love'],
    'To be': ['be'],
    'To have': ['have'],
    'The English alphabet': ['hello', 'name', 'word'],

    # School
    'Saying Hello': ['hello', 'hi', 'goodbye', 'thank you', 'please',
                     'yes', 'no', 'sorry', 'excuse me'],

    # Travel
    'Check-in dialogue': ['hello', 'thank you', 'please', 'airport', 'hotel',
                          'name', 'sorry'],
    'Airport signs': ['airport', 'station', 'bus', 'car'],
    'Booking a room': ['hotel', 'please', 'thank you', 'room', 'bathroom',
                       'bed', 'key'],
    'Hotel facilities': ['room', 'bathroom', 'bed', 'window', 'door',
                         'kitchen', 'TV'],

    # Business
    'Formal vs informal': ['thank you', 'please', 'sorry', 'welcome'],
    'Email phrases': ['thank you', 'please', 'sorry', 'welcome'],
    'Making a call': ['hello', 'thank you', 'phone'],
    'Leaving a message': ['hello', 'thank you', 'name', 'phone'],
}


class Command(BaseCommand):
    help = "200+ A1-A2 so'zlarni yaratish va vocabulary darslariga biriktirish."

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help="Avval barcha so'zlarni o'chiradi",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING("⚠️  Reset: barcha so'zlar o'chiriladi..."))
            LessonWord.objects.all().delete()
            Word.objects.all().delete()

        self.stdout.write(f"📚 {len(WORDS)} ta so'z qo'shilmoqda...\n")

        created_words = []
        for w_data in WORDS:
            (word, pos, uz, ru, ipa, ex_en, ex_uz, cefr, freq) = w_data

            obj, created = Word.objects.get_or_create(
                word=word,
                part_of_speech=pos,
                translation_uz=uz,
                defaults={
                    'translation_ru': ru,
                    'pronunciation': ipa,
                    'example_sentence': ex_en,
                    'example_translation': ex_uz,
                    'cefr_level': cefr,
                    'frequency_rank': freq,
                    'is_published': True,
                },
            )
            if created:
                created_words.append(obj)

        # Vocabulary darslariga avtomatik biriktirish
        self._attach_words_to_lessons()

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ {len(created_words)} ta yangi so'z qo'shildi. "
            f"Jami: {Word.objects.count()} ta so'z."
        ))

    def _attach_words_to_lessons(self):
        """Vocabulary lessonlariga aloqador so'zlarni biriktiramiz."""
        self.stdout.write("\n🔗 So'zlarni lessonlarga biriktirish...")

        attached_count = 0
        for lesson_title, word_list in LESSON_WORD_MAP.items():
            lessons = Lesson.objects.filter(title__icontains=lesson_title)
            for lesson in lessons:
                for order, word_text in enumerate(word_list, start=1):
                    word = Word.objects.filter(word=word_text).first()
                    if not word:
                        continue
                    _, created = LessonWord.objects.get_or_create(
                        lesson=lesson,
                        word=word,
                        defaults={
                            'order': order,
                            'is_key_word': order <= 5,  # birinchi 5 ta — key word
                        },
                    )
                    if created:
                        attached_count += 1

        self.stdout.write(f"   {attached_count} ta yangi biriktirish.")