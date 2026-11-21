# KPRM - Cyfrowy asystent ocen okresowych - wymagania

## Źródła analizy
Główny dokument opisujący wyzwanie:
- `KPRM - Cyfrowy asystent ocen - aktualne/Opis wyzwania - cyfrowy asystent ocen okresowych-19.11.26.docx`

Dostępne zasoby w paczce:
- `KPRM - Cyfrowy asystent ocen - aktualne/1. Akty prawne/` - akty prawne
- `KPRM - Cyfrowy asystent ocen - aktualne/2. Przypadki użycia/` - use cases
- `KPRM - Cyfrowy asystent ocen - aktualne/3. Schemat procesu/` - schemat procesu
- `KPRM - Cyfrowy asystent ocen - aktualne/4. Formularze ocen/` - wzory formularzy
- `KPRM - Cyfrowy asystent ocen - aktualne/5. Przykładowe wypełnione formularze oceny/` - przykłady
- `KPRM - Cyfrowy asystent ocen - aktualne/6. Materiały dodatkowe/` - poradnik i liczenie terminów

## Cel i kontekst
Stworzenie cyfrowego asystenta ocen okresowych w służbie cywilnej, który automatyzuje i cyfryzuje proces oceny, upraszcza formalności, analizuje dane i rekomenduje działania. Rozwiązanie ma wspierać przełożonych i pracowników na wszystkich etapach procesu oceny oraz pomagać wykorzystywać wyniki oceny w zarządzaniu zespołem.

Referencja: `Opis wyzwania - cyfrowy asystent ocen okresowych-19.11.26.docx` sekcje 1-2.

## Użytkownicy końcowi
- Osoby oceniające (przełożeni)
- Oceniani
- Komórki kadrowe koordynujące proces ocen i prowadzące dokumentację pracowniczą
- Ewentualnie dyrektor generalny/kierownik urzędu - wgląd statystyczny

Referencja: `Opis wyzwania...` sekcja 3 Oczekiwany rezultat.

## Wymagania funkcjonalne - automatyzacja procesu oceny

### 1. Cyfrowa forma oceny
- Przeprowadzenie procesu oceny okresowej w formie cyfrowej, bez papieru.
- Odwzorowanie wszystkich pól arkuszy oceny A/B/C.
- Wgląd do arkuszy dla uprawnionych osób i możliwość edycji.
- Wydruk formularza oceny zgodny z wzorem z rozporządzenia.

Referencja: `Opis wyzwania...` sekcja 3.1; `4. Formularze ocen/schematy widoku formularza A/B/C oceny okresowej/wzór formularza oceny okresowej arkusz A/B/C.pdf`; `4. Formularze ocen/schematy widoku formularza A/B/C oceny okresowej/formularz oceny okresowej A/B/C - schemat pól formularza.docx`

### 2. Wybór arkusza i kryteriów
- Automatyczny wybór odpowiedniego arkusza oceny A/B/C zależnie od rodzaju stanowiska.
- Wybór kryteriów oceny - maksymalnie 3 dodatkowe kryteria.
- Kryteria obowiązkowe są stałe dla arkusza, kryteria dodatkowe wybiera oceniający na początku cyklu.

Referencja: `Opis wyzwania...` sekcja 3.1; `3. Schemat procesu/Skrócony opis procesu oceny i podstawowych pojęć.docx`; `2. Przypadki użycia/use cases - opis.docx` - wyznaczenie kryteriów oceny.

### 3. Przygotowanie do rozmów
Cyfrowy asystent wspiera przełożonego w przygotowaniu do:
- rozmowy rozpoczynającej ocenę
- rozmowy oceniającej
- opcjonalnie bieżących rozmów o informacji zwrotnej

Funkcje:
- wsparcie w ustaleniu celu rozmowy
- propozycje pytań i tematów do rozmowy
- podpowiedzi dotyczące komunikacji, w tym trudnych sytuacji
- możliwość zapisywania notatek i obserwacji w trakcie okresu oceny (co do zasady 24 miesiące)
- wykorzystanie notatek do sporządzenia oceny i przygotowania do rozmowy oceniającej

Referencja: `Opis wyzwania...` sekcja 3.1; `2. Przypadki użycia/use cases - warunki brzegowe.docx`

### 4. Sporządzenie oceny
- Wsparcie oceniającego w formułowaniu treści oceny na podstawie własnych obserwacji, danych i decyzji.
- Asystent nie zastępuje przełożonego, pomaga uporządkować informacje, wskazuje elementy wymagane przepisami, wspiera w jasnym i spójnym opisaniu wyników.
- Identyfikacja zależności między informacjami i podpowiedzi co warto uwzględnić.
- Możliwość eksportu oceny do pliku lub druku.
- Uwzględnianie sytuacji kadrowych: zmiana oceniającego, zmiana zadań, długotrwała nieobecność.
- Integracja/współpraca z systemem obiegu dokumentacji w eZD lub programami e-mail.

Referencja: `Opis wyzwania...` sekcja 3.1; `2. Przypadki użycia/use cases - opis.docx`

### 5. Część rozwojowa
- Podpowiadanie jak formułować konstruktywną informację zwrotną
- Sugerowanie szkoleń, form wsparcia i działań rozwojowych na podstawie zidentyfikowanych obszarów
- Pomoc w opisie mocnych stron i obszarów do rozwoju
- Wskazywanie jak przekładać wyniki oceny na codzienne zarządzanie zespołem

Referencja: `Opis wyzwania...` sekcja 3.1

## Wymagania funkcjonalne - automatyzacja formalności
- Przypomnienia o terminach
- Automatyczne podpowiedzi wymaganych elementów oceny
- Minimalizacja ryzyka błędów formalnych
- Prowadzenie użytkownika krok po kroku przez etapy oceny
- Generowanie treści zgodnych z przepisami

Referencja: `Opis wyzwania...` sekcja 3.2

## Moduł wirtualnego HR partnera
Innowacyjny moduł wspierający zarządzanie ludźmi, może wykorzystywać AI.

Funkcje:
- Analiza danych dotyczących zadań pracownika i ich realizacji, zmian zakresu obowiązków
- Wsparcie w rozmowach o kondycji pracownika
- Podpowiedzi działań wspierających dobrostan: zmiana priorytetów, przerwa w projektach, rozmowa wspierająca
- Wskazywanie działań rozwojowych przeciwdziałających wypaleniu
- Sygnalizowanie sygnałów przeciążenia, spadku motywacji, ryzyka wypalenia
- Sugerowanie rozwiązań organizacyjnych: podział zadań, wsparcie zespołu, mentoring
- Działania prewencyjne
- Budowanie kultury doceniania - sygnalizowanie momentów do wzmocnienia pozytywnych zachowań, podpowiedzi budujące zaangażowanie i poczucie wartości

Referencja: `Opis wyzwania...` sekcja 3.3

## Wymagania formalne projektu do oceny
Projekt powinien zawierać:
- tytuł projektu
- opis proponowanego rozwiązania
- identyfikację problemu i sposobu rozwiązania
- prezentację PDF max 15 slajdów
- materiał demonstracyjny / prototyp narzędzia

Dodatkowo może zawierać:
- repozytorium kodu źródłowego
- zrzuty ekranu
- link do demonstracji
- dokumentację techniczną
- materiały graficzne

Referencja: `Opis wyzwania...` sekcja 4

## Wymagania techniczne
- Neutralność technologiczna - możliwość uruchomienia w różnych środowiskach IT, bez płatnych licencji
- Łatwe wdrożenie - proste w instalacji, gotowe po krótkiej konfiguracji, bez specjalistycznego szkolenia
- Przygotowane do pracy w małych i dużych urzędach, o różnym poziomie cyfryzacji
- Możliwość łatwej aktualizacji - szybkie wprowadzanie zmian przy błędach lub nowych potrzebach
- Zgodność z przepisami ustawy o służbie cywilnej oraz regulacjami ochrony danych
- Elastyczne na zmiany przepisów - aktualizacja modułów prawnych bez przebudowy systemu
- Bezpieczne dane - mechanizmy kontroli dostępu, ochrona danych osobowych, anonimizacja przy przetwarzaniu poza infrastrukturą użytkownika

Referencja: `Opis wyzwania...` sekcja 5

## Sposób testowania / walidacji
Podczas prezentacji należy zaprezentować cały proces sporządzania oceny okresowej, aby sprawdzić:
- stopień odwzorowania działań w procesie oceny
- poprawność formalna i merytoryczna odwzorowania procesów
- wsparcie pracowników w realizacji ocen
- wsparcie kierowników w zarządzaniu ludźmi - moduł HR partnera

Referencja: `Opis wyzwania...` sekcja 6

## Kryteria oceny projektu
- Związek z wyzwaniem, zakres odwzorowania czynności/procedur oraz zgodność z przepisami prawa - 30%
- Oryginalność pomysłu - 20%
- Kompletność projektu - 20%
- Potencjał wdrożeniowy - możliwość wdrożenia w większości urzędów, możliwość aktualizacji i naprawy błędów - 30%

Referencja: `Opis wyzwania...` sekcja 8

## Dodatkowe uwagi kontekstowe
- KPRM planuje wdrożenie rozwiązania w całości lub w części
- Najlepszy zespół zaproszony do współpracy przy dalszym rozwoju
- Procedowana jest zmiana przepisów ustawy o służbie cywilnej - rozwiązanie musi być dostosowywalne do nowych przepisów

Referencja: `Opis wyzwania...` sekcja 9

## Lista formularzy do przetworzenia / wygenerowania

### Wzorcowe formularze oceny okresowej
1. Arkusz A oceny okresowej
   - Wzór PDF: `4. Formularze ocen/schematy widoku formularza A oceny okresowej/wzór formularza oceny okresowej arkusz A.pdf`
   - Schemat pól: `4. Formularze ocen/schematy widoku formularza A oceny okresowej/formularz oceny okresowej A - schemat pól formularza.docx`
   - Dodatkowy plik: `4. Formularze ocen/schematy widoku formularza A oceny okresowej/~$rmularz pierwszej oceny - schmat pól formularza.docx`

2. Arkusz B oceny okresowej
   - Wzór PDF: `4. Formularze ocen/schematy widoku formularza B oceny okresowej/wzór formularza oceny okresowej arkusz B.pdf`
   - Schemat pól: `4. Formularze ocen/schematy widoku formularza B oceny okresowej/formularz oceny okresowej B - schemat pól formularza.docx`
   - Wersja zautomatyzowana Excel: `4. Formularze ocen/8. Arkusz B-wersja zautomatyzowana.xlsx`
   - Dodatkowy plik: `4. Formularze ocen/schematy widoku formularza B oceny okresowej/~$rmularz pierwszej oceny - schmat pól formularza.docx`

3. Arkusz C oceny okresowej
   - Wzór PDF: `4. Formularze ocen/schematy widoku formularza C oceny okresowej/wzór formularza oceny okresowej arkusz C.pdf`
   - Schemat pól: `4. Formularze ocen/schematy widoku formularza C oceny okresowej/formularz oceny okresowej C - schemat pól formularza.docx`
   - Dodatkowy plik: `4. Formularze ocen/schematy widoku formularza C oceny okresowej/~$rmularz pierwszej oceny - schmat pól formularza.docx`

### Przykładowe wypełnione formularze oceny
- `5. Przykładowe wypełnione formularze oceny/1) Arkusz oceny A - GLW.docx`
- `5. Przykładowe wypełnione formularze oceny/2) Arkusz oceny B - naczelnik.docx`
- `5. Przykładowe wypełnione formularze oceny/3) Arkusz oceny B - kierownik odd..docx`
- `5. Przykładowe wypełnione formularze oceny/4) Arkusz oceny C - główny spec.(neg).docx`
- `5. Przykładowe wypełnione formularze oceny/5) Arkusz oceny C - radca.docx`
- `5. Przykładowe wypełnione formularze oceny/6) Arkusz A - PLW (poradnik).pdf`
- `5. Przykładowe wypełnione formularze oceny/7) Arkusz B - naczelnik wydziału (poradnik).pdf`
- `5. Przykładowe wypełnione formularze oceny/8) Arkusz C - inspektor (poradnik).pdf`
- `5. Przykładowe wypełnione formularze oceny/09) Arkusz oceny C - gł specjalista (neg.).docx`
- `5. Przykładowe wypełnione formularze oceny/10) Arkusz oceny C - archiwista.docx`
- `5. Przykładowe wypełnione formularze oceny/11) Arkusz oceny C - główny analityk.docx`
- `5. Przykładowe wypełnione formularze oceny/12) Arkusz oceny C - specjalista (negatywna).docx`
- `5. Przykładowe wypełnione formularze oceny/13) Arkusz oceny B - dyrektor dep..docx`

## Szczegółowe referencje do przypadków użycia i warunków brzegowych
- Opis przypadków użycia: `2. Przypadki użycia/use cases - opis.docx`
- Warunki brzegowe: `2. Przypadki użycia/use cases - warunki brzegowe.docx`
- Schemat procesu: `3. Schemat procesu/Skrócony opis procesu oceny i podstawowych pojęć.docx`
- Schemat BPMN/XPDL: `3. Schemat procesu/przepływ procesu (plik bizagi modeler bpmn).bpm`, `3. Schemat procesu/przepływ procesu (plik xpdl).xpdl`, `3. Schemat procesu/przepływ procesu (plik png).png`
- Liczenie terminów: `6. Materiały dodatkowe/liczenie terminów.docx`
- Poradnik: `6. Materiały dodatkowe/Poradnik - oceny okresowe w służbie cywilnej.pdf`

## Akty prawne
- `1. Akty prawne/1. Rozporządzenie w sprawie ocen okresowych.pdf`
- `1. Akty prawne/2. Ustawa o służbie cywilnej - wyciąg przepisów.docx`
- `1. Akty prawne/3. Ustawa o służbie cywilnej - cała.pdf`
- `1. Akty prawne/4. Standardy zarządzania zzl w sc.pdf`

---
Wygenerowano na podstawie analizy paczki `KPRM - Cyfrowy asystent ocen - aktualne`.
