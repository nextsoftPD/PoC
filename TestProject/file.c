#include <stdio.h>
#include <math.h>

// La funzione deve calcolare e stampare i primi n numeri di Fibonacci.
void stampaFibonacci(int n) {
    int a = 0, b = 1, temp;
    printf("Numeri di Fibonacci: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", a);
        temp = a + b;
        a = b;
        b = temp;
    }
    printf("\n");
}

// La funzione deve calcolare il fattoriale di un numero dato.
int calcolaFattoriale(int n) {
    if (n == 0) return 1;
    return n * calcolaFattoriale(n - 1);
}

// La funzione deve determinare se un numero dato è un numero primo.
int isPrimo(int n) {
    if (n <= 1) return 0;
    for (int i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}

// La funzione deve stampare tutti i numeri primi minori o uguali a un numero dato.
void stampaNumeriPrimi(int limite) {
    printf("Numeri primi fino a %d: ", limite);
    for (int i = 2; i <= limite; i++) {
        if (isPrimo(i)) {
            printf("%d ", i);
        }
    }
    printf("\n");
}

// La funzione deve calcolare la somma di tutti gli elementi di un array.
int sommaArray(int arr[], int size) {
    int somma = 0;
    for (int i = 0; i < size; i++) {
        somma += arr[i];
    }
    return somma;
}

// La funzione deve trovare l'elemento massimo in un array.
int trovaMassimo(int arr[], int size) {
    int max = arr[0];
    for (int i = 1; i < size; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}

// La funzione deve invertire una stringa data.
void invertiStringa(char str[]) {
    int start = 0, end = 0;
    while (str[end] != '\0') end++;
    end--;
    while (start < end) {
        char temp = str[start];
        str[start] = str[end];
        str[end] = temp;
        start++;
        end--;
    }
}

// La funzione deve calcolare il minimo comune multiplo di due numeri.
int calcolaMCM(int a, int b) {
    int max = (a > b) ? a : b;
    while (1) {
        if (max % a == 0 && max % b == 0) {
            return max;
        }
        max++;
    }
}

// La funzione deve calcolare il massimo comun divisore di due numeri.
int calcolaMCD(int a, int b) {
    if (b == 0) return a;
    return calcolaMCD(b, a % b);
}

// La funzione deve generare e stampare una matrice identità di dimensione n x n.
void stampaMatriceIdentita(int n) {
    printf("Matrice identità di dimensione %d:\n", n);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (i == j) printf("1 ");
            else printf("0 ");
        }
        printf("\n");
    }
}