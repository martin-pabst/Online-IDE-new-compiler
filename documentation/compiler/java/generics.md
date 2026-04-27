# Generics
In this text ``A, B, C`` denote classes, ``I, J, K`` denote interfaces, ``S, T, U`` denote type parameters.
  * ``A < B`` stands for "``A`` can explicitly get cast to ``B``, that is: ``(A)B`` is correct at compiletime. 
  * ``A << B`` stands for "``A`` can implicitly get cast to ``B``. 
## Casting 
  * ``A extends B`` => ``A < B``
  * ``A implements I`` => ``A < I``
  * ``A < B`` => ``A<T> < B<T>``
  * ``A < B`` => ``A<T> < B<?>``
  * ``A < B`` => ``A < B<?>``
  * ``A < B`` => ``A<? extends C> < B<? extends C>``
  * **but not:** ``S extends T`` => ``A<S> < A<T>``
  * ``A<S> < A``
  * ``B < C`` => ``A<B> < A<? extends C>``
  * ``A < B`` => ``C<B> < C<? super A>``
  
```typescript
```



https://angelikalanger.com/GenericsFAQ/FAQSections/TechnicalDetails.html#FAQ201


