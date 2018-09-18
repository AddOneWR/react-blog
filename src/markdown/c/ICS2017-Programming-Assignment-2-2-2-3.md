## PA2.2 程序，运行时的环境与AM


### 运行更多的程序

让项目默认编译到`x86-nemu`中的AM中
```C
// nexus-am/Makefile.check
ARCH ?= x86-nemu

ARCHS = $(shell ls $(AM_HOME)/am/arch/)
```

然后在`nexus-am/tests/cputest`中执行

```C
make ALL=xxx run
```

> xxx为程序名(无.c后缀)

#### 实现更多的指令

在完成更多指令之前我们要先完成`rtl.h`中的辅助函数

```C
#define make_rtl_setget_eflags(f) \
  static inline void concat(rtl_set_, f) (const rtlreg_t* src) { \
    cpu.eflags.f = *src;  \
  } \
  static inline void concat(rtl_get_, f) (rtlreg_t* dest) { \
    *dest = cpu.eflags.f; \
  }
```

根据提示简单的完成标志位赋值

```C
static inline void rtl_not(rtlreg_t* dest) {
  // dest <- ~dest
  rtl_li(dest,~(*dest));
}
```

取反

```C
static inline void rtl_update_ZF(const rtlreg_t* result, int width) {
  // eflags.ZF <- is_zero(result[width * 8 - 1 .. 0])
    assert (width == 4 || width == 2 || width == 1);
    cpu.eflags.ZF = (*result & ~(0xffffffff << (8 * width - 1) << 1)) == 0;
}
```

根据提示更新`ZF`位，同时判断长度`width`

```C
static inline void rtl_update_SF(const rtlreg_t* result, int width) {
  // eflags.SF <- is_sign(result[width * 8 - 1 .. 0])
 assert (width == 4 || width == 2 || width == 1);
 cpu.eflags.SF = (*result >> (8 * width - 1)) & 0x1;
}
```

根据提示更新`SF`位，同时判断长度`width`

#### 完成指令
主要任务是完成`nemu/src/cpu/exec/`下每个文件的`TODO`，先在该目录下执行`ls`看一下文件

```
all-instr.h  arith.c  cc.c  control.c  data-mov.c  exec.c  logic.c  prefix.c  special.c  system.c
```

> 接下来我们按`ls`展示的文件顺序进行分析

#### all-instr.h

`all-instr.h`为你写的函数定义的文件，先看看在文件完成后定义的全部指令

```C
include "cpu/exec.h"

make_EHelper(mov);

make_EHelper(operand_size);

make_EHelper(cltd);
make_EHelper(cwtl);
make_EHelper(idiv);
make_EHelper(div);
make_EHelper(sbb);
make_EHelper(dec);
make_EHelper(shl);
make_EHelper(sar);
make_EHelper(or);
make_EHelper(adc);
make_EHelper(dec);
make_EHelper(mul);
make_EHelper(imul);
make_EHelper(imul1);
make_EHelper(imul2);
make_EHelper(jmp_rm);
make_EHelper(jmp);
make_EHelper(inc);
make_EHelper(leave);
make_EHelper(cltd);
make_EHelper(jcc);
make_EHelper(test);
make_EHelper(movzx);
make_EHelper(movsx);
make_EHelper(setcc);
make_EHelper(nop);
make_EHelper(xchg);
make_EHelper(and);
make_EHelper(leave);
make_EHelper(cltd);
make_EHelper(dec);
make_EHelper(cmp);
make_EHelper(neg);
make_EHelper(not);
make_EHelper(or);
make_EHelper(shr);
make_EHelper(sar);
make_EHelper(lea);
make_EHelper(add);
make_EHelper(inv);
make_EHelper(nemu_trap);
make_EHelper(call);
make_EHelper(call_rm);
make_EHelper(push);
make_EHelper(sub);
make_EHelper(pop);
make_EHelper(xor);
make_EHelper(ret);
```

#### arith.c

##### Add
```C
make_EHelper(add) {
  rtl_add(&t2, &id_dest->val, &id_src->val);
  operand_write(id_dest, &t2);

  rtl_update_ZFSF(&t2, id_dest->width);

  rtl_sltu(&t0, &t2, &id_dest->val);
  rtl_set_CF(&t0);

  rtl_xor(&t0, &id_dest->val, &id_src->val);
  rtl_not(&t0);
  rtl_xor(&t1, &id_dest->val, &t2);
  rtl_and(&t0, &t0, &t1);
  rtl_msb(&t0, &t0, id_dest->width);
  rtl_set_OF(&t0);
  print_asm_template2(add);
}
```

查看`i386`手册，`ADD`执行两个操作数（DEST和SRC）的整数相加。 加法结果被分配给第一个操作数（DEST），并相应地设置标志位，当立即字节被添加到字或双字操作数时，立即值被符号扩展为字或双字的大小的操作数，发现其与`Adc`相似，只需修改部分即可，然后填入`opcode table`中

```C
make_group(gp1,
    EX(add),....

/* 0x00 */  IDEXW(G2E, add, 1), IDEX(G2E, add), IDEXW(E2G, add, 1), IDEX(E2G, add),
/* 0x04 */  IDEXW(I2a, add, 1), IDEX(I2a, add), EMPTY, EMPTY,
```

> 译码函数查询`decode.c`,同时对照`i386`手册填写即可，以下不在赘述

##### Sub

```C
make_EHelper(sub) {
  rtl_sub(&t2, &id_dest->val, &id_src->val);
  operand_write(id_dest, &t2);

  rtl_update_ZFSF(&t2, id_dest->width);

  rtl_sltu(&t0, &id_dest->val, &t2);
  rtl_set_CF(&t0);

  rtl_xor(&t0, &id_dest->val, &id_src->val);
  rtl_xor(&t1, &id_dest->val, &t2);
  rtl_and(&t0, &t0, &t1);
  rtl_msb(&t0, &t0, id_dest->width);
  rtl_set_OF(&t0);

  print_asm_template2(sub);
}
```

`SUB`从第一个操作数（`DEST`）中减去第二个操作数（`SRC`）。 第一个操作数分配了相减的结果，并相应地设置标志。当从字操作数中减去一个立即字节值时，立即值首先被符号扩展为目标操作数的大小。根据`Add`指令相反的写`Sub`即可，也可以参考`Sbb`指令

```C
/* 0x28 */  IDEXW(G2E, sub, 1), IDEX(G2E, sub), IDEXW(E2G, sub, 1), IDEX(E2G, sub),
/* 0x2c */  IDEXW(I2a, sub, 1), IDEX(I2a, sub), EMPTY, EMPTY,
```

##### Cmp

```C
make_EHelper(cmp) {
  rtl_sub(&t0, &id_dest->val, &id_src->val);

  rtl_update_ZFSF(&t0, id_dest->width);

  rtl_sltu(&t1, &id_dest->val, &id_src->val);
  rtl_set_CF(&t1);

  rtl_xor(&t0, &id_dest->val, &t0);
  rtl_xor(&t1, &id_dest->val, &id_src->val);
  rtl_and(&t0, &t1, &t0);
  rtl_msb(&t0, &t0, id_dest->width);
  rtl_set_OF(&t0);

  print_asm_template2(cmp);
}
```

`Cmp`指令很简单，与`Sub`十分类似只是不需要写回，所以只要把`operand_write(id_dest, &)`去掉即可

```C
make_group(gp1,
    EX(add), EX(or), EX(adc), EX(sbb),
    EX(and), EX(sub), EX(xor), EX(cmp)）

/* 0x38 */  IDEXW(G2E, cmp, 1), IDEX(G2E, cmp), IDEXW(E2G, cmp, 1), IDEX(E2G, cmp),
/* 0x3c */  IDEXW(I2a, cmp, 1), IDEX(I2a, cmp), EMPTY, EMPTY,
```

##### Inc

```C
make_EHelper(inc) {
  rtl_addi(&t0, &id_dest->val, 1);
  operand_write(id_dest, &t0);

  rtl_update_ZFSF(&t0, id_dest->width);
  rtl_eqi(&t1, &id_dest->val, 0xffffffff);
  rtl_set_CF(&t1);

  rtl_slt(&t1, &t0, &id_dest->val);
  rtl_set_OF(&t1);

  print_asm_template1(inc);
}
```

`INC`在操作数上加1。 它不会更改进位标志。 要影响进位标志，请使用第二个操作数为1的`ADD`指令。解释很明确，使用`Addi`指令，然后更新标志位即可

```C
make_group(gp4,
    EX(inc), EX(dec), EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY)

/* 0x40 */  IDEX(r, inc), IDEX(r, inc), IDEX(r, inc), IDEX(r, inc),
/* 0x44 */  IDEX(r, inc), IDEX(r, inc), IDEX(r, inc), IDEX(r, inc),
```

##### Dec

```C
make_EHelper(dec) {
  rtl_subi(&t2, &id_dest->val, 1);
  operand_write(id_dest, &t2);

  rtl_update_ZFSF(&t2, id_dest->width);

  rtl_xor(&t0, &id_dest->val, &id_src->val);
  rtl_xor(&t1, &id_dest->val, &t2);
  rtl_and(&t0, &t0, &t1);
  rtl_msb(&t0, &t0, id_dest->width);
  rtl_set_OF(&t0);

  print_asm_template1(dec);
}
```

DEC从操作数中减去1。 DEC不会更改进位标志。 要影响进位标志，请使用立即操作数为1的SUB指令。这里和上面的`Inc`类似，使用`subi`指令，然后照着`Inc`反着写`Dec`，更新标志位即可

```C
make_group(gp4,
    EX(inc), EX(dec), EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY)

/* 0x48 */  IDEX(r, dec), IDEX(r, dec), IDEX(r, dec), IDEX(r, dec),
/* 0x4c */  IDEX(r, dec), IDEX(r, dec), IDEX(r, dec), IDEX(r, dec),
```

##### Neg

```C
make_EHelper(neg) {
  rtl_mv(&t0, &id_dest->val);
  rtl_not(&t0);
  rtl_addi(&t0, &t0, 1);
  operand_write(id_dest, &t0);

  rtl_eq0(&t1, &id_dest->val);
  rtl_set_CF(&t1);

  rtl_update_ZFSF(&t0, id_dest->width);
  rtl_xor(&t1, &t0, &id_dest->val);
  rtl_not(&t1);
  rtl_msb(&t1, &t1, id_dest->width);
  rtl_set_OF(&t1);

  print_asm_template1(neg);
}
```

`Neg`用其二进制补码替代寄存器或存储器操作数的值。操作数从零中减去，结果放在操作数中。进位标志被设置为1，除非操作数为零，在这种情况下，进位标志被清除为0。根据描述调用相应的`rtl`函数即可

```C
make_group(gp3,
    IDEX(test_I, test), EMPTY, EX(not), EX(neg),
    EX(mul), EX(imul1), EX(div), EX(idiv))
```

#### control.c

##### ret

```C
make_EHelper(ret) {
  rtl_pop(&decoding.jmp_eip);
  decoding.is_jmp = 1;
  print_asm("ret");
}
```

`RET`将控制权转交给位于堆栈上的返回地址。地址通常由CALL指令放置在堆栈上，并返回到CALL之后的指令。简单来说就是把`jmp_eip`推出然后设置跳转即可

```C
/* 0xc0 */  IDEXW(gp2_Ib2E, gp2, 1), IDEX(gp2_Ib2E, gp2), EMPTY, EX(ret),
```

#### data-mov.c

##### leave

```C
make_EHelper(leave) {
 rtl_mv(&cpu.esp, &cpu.ebp);
 rtl_pop(&cpu.ebp);

  print_asm("leave");
}
```

`LEAVE`反转`ENTER`指令的动作。通过将帧指针复制到堆栈指针，`LEAVE`释放过程为其局部变量使用的堆栈空间。旧的帧指针被弹出到BP或EBP中，恢复调用者的帧。 随后的RET指令将删除所有推送到退出过程堆栈上的参数。简单来说就是将`ebp`赋值给`esp`然后推出`ebp`，调用`rtl`函数直接完成

```C
/* 0xc8 */  EMPTY, EX(leave), EMPTY, EMPTY,
```

##### cltd

```C
make_EHelper(cltd) {
  if (decoding.is_operand_size_16) {
    rtl_lr(&t0, R_AX, 2);
    if ((int32_t)(int16_t)(uint16_t)t0 < 0) {
      rtl_addi(&t1, &tzero, 0xffff);
      rtl_sr(R_DX, 2, &t1);
    }
    else {
      rtl_sr(R_DX, 2, &tzero);
    }
  }
  else {
    rtl_lr(&t0, R_EAX, 4);
    if ((int32_t)t0 < 0) {
      rtl_addi(&t1, &tzero, 0xffffffff);
      rtl_sr(R_EDX, 4, &t1);
    }
    else {
      rtl_sr(R_EDX, 4, &tzero);
    }
  }

  print_asm(decoding.is_operand_size_16 ? "cwtl" : "cltd");
}
```

`CLD`清除方向标志。 没有其他标志或寄存器受到影响。 `CLD`执行后，字符串操作会增加它们使用的索引寄存器（`SI`和/或`DI`)。

```C
/* 0x98 */  EX(cwtl), EX(cltd), EMPTY, EMPTY,
```

#### logic.c

##### test

```C
make_EHelper(test) {
  rtl_and(&t2, &id_dest->val, &id_src->val);
  rtl_set_CF(&tzero);
  rtl_set_OF(&tzero);
  rtl_update_ZFSF(&t2,id_dest->width);
  print_asm_template2(test);
}
```

`TEST`计算其两个操作数的按位逻辑“与”。如果两个操作数的相应位都是1，结果为1; 否则，每一位都是0.操作的结果被丢弃，只有标志被修改。所以将两个操作数`and`之后仅设置标志位即可

```C
make_group(gp3,
    IDEX(test_I, test), EMPTY, EX(not), EX(neg),
    EX(mul), EX(imul1), EX(div), EX(idiv))

/* 0x84 */  IDEXW(G2E, test ,1), IDEX(G2E, test), EMPTY, EMPTY,
```

##### and

```C
make_EHelper(and) {
  rtl_and(&t2, &id_dest->val, &id_src->val);
  operand_write(id_dest, &t2);
  rtl_set_CF(&tzero);
  rtl_set_OF(&tzero);
  rtl_update_ZFSF(&t2,id_dest->width);
  print_asm_template2(and);
}
```

如果操作数的两个相应位都是1，AND指令的结果的每一位都是1; 否则，它变成0。与`Test`类似，只需添加将结果写回即可。

```C
make_group(gp1,
    EX(add), EX(or), EX(adc), EX(sbb),
    EX(and), EX(sub), EX(xor), EX(cmp))

/* 0x20 */  IDEXW(G2E, and, 1), IDEX(G2E, and), IDEXW(E2G, and, 1), IDEX(E2G, and),
/* 0x24 */  IDEXW(I2a, and, 1), IDEX(I2a, and), EMPTY, EMPTY,
```

##### or

```C
make_EHelper(or) {
  rtl_or(&t2, &id_dest->val, &id_src->val);
  operand_write(id_dest, &t2);
  rtl_set_CF(&tzero);
  rtl_set_OF(&tzero);
  rtl_update_ZFSF(&id_dest->val,id_dest->width);
  print_asm_template2(xor);
}
```

OR计算其两个操作数的包含OR，并将结果放入第一个操作数中。 如果操作数的相应位都是0，结果的每一位都是0; 否则，每一位都是1。与`And`指令相同，只需将`rtl_and`修改为`rtl_or`即可

```C
make_group(gp1,
    EX(add), EX(or), EX(adc), EX(sbb),
    EX(and), EX(sub), EX(xor), EX(cmp))

/* 0x08 */  IDEXW(G2E, or, 1), IDEX(G2E, or), IDEXW(E2G, or, 1), IDEX(E2G, or),
```

##### sar

```C
make_EHelper(sar) {
  // unnecessary to update CF and OF in NEMU
  rtl_sar(&t2, &id_dest->val, &id_src->val);
  operand_write(id_dest, &t2);
  rtl_update_ZFSF(&t2, id_dest->width);

  print_asm_template2(sar);
}
```

`SAR`向下移动操作数的位。低阶位移入进位标志。`SAR`执行有符号的分割，向负无穷大舍入（与`IDIV`不同; 高位保持不变。先判断操作数宽度进行扩展，然后调用`rtl_sar`函数，将结果写回并更新符号位。

```C
make_EHelper(shr) {
  // unnecessary to update CF and OF in NEMU
  rtl_shr(&t2, &id_dest->val, &id_src->val);
  operand_write(id_dest, &t2);
  rtl_update_ZFSF(&t2, id_dest->width);

  print_asm_template2(shr);
}
```

`SHR`与`SAR`类似,`SHR`执行未标记的划分; 高位被设置为0。写法与`Sar`类似，调用`rtl_shr`函数后写回，更新标志位

```C
make_EHelper(shl) {
  // unnecessary to update CF and OF in NEMU
  rtl_shl(&t2, &id_dest->val, &id_src->val);
  operand_write(id_dest, &t2);
  rtl_update_ZFSF(&t2, id_dest->width);

  print_asm_template2(shl);
}
```

`SAL`(或其同义词`SHL`）向上移动操作数的位。 高位移入进位标志，低位设为0。与上面两个指令类似，调用`rtl_shl`函数，将结果写回，更新标志位

> 以上三个函数根据提示不需要更新`CF`和`OF`位

```C
make_group(gp2,
    EMPTY, EMPTY, EMPTY, EMPTY,
    EX(shl), EX(shr), EMPTY, EX(sar))
```

##### setcc

```C
make_EHelper(setcc) {
  uint8_t subcode = decoding.opcode & 0xf;
  rtl_setcc(&t2, subcode);
  operand_write(id_dest, &t2);

  print_asm("set%s %s", get_cc_name(subcode), id_dest->str);
}
```

在这里可以看到调用了`rtl_setcc`，我们要去`cc.c`文件中对指令进行补全

#### cc.c
```C
switch (subcode & 0xe) {
  case CC_O:
    rtl_li(dest, cpu.eflags.OF);
    break;
  case CC_B:
    rtl_li(dest, cpu.eflags.CF);
    break;
  case CC_E:
    rtl_get_ZF(&t0);
    rtl_eqi(dest, &t0, 1);
    break;
  case CC_NE:
    rtl_get_ZF(&t0);
    rtl_neq0(dest, &t0);
    break;
  case CC_BE:
    rtl_li(dest, ((cpu.eflags.CF) || (cpu.eflags.ZF)));
    break;
  case CC_S:
    rtl_li(dest, cpu.eflags.SF);
    break;
  case CC_L:
    rtl_li(dest, (cpu.eflags.SF != cpu.eflags.OF));
    break;
  case CC_LE:{
    rtl_li(dest, ((cpu.eflags.ZF) || (cpu.eflags.SF != cpu.eflags.OF)));
    break;
  }
  default: panic("should not reach here");
  case CC_P: panic("n86 does not have PF");
}
```

这里根据`i386`补全了部分需要用到的指令:

+ `CC_O`: 将`OF`赋值给操作数
+ `CC_B`: 将`CF`赋值给操作数
+ `CC_E`: 获取`ZF`, 然后判断`ZF`是否为`1`，若是则`dest`为`1`，否则为`0`
+ `CC_NE`: 获取`ZF`, 然后判断`ZF`是否不等于`0`，若是则`dest`为`1`，否则为`0`
+ `CC_BE`: 将`CF`和`ZF`取或后结果赋值给`dest`
+ `CC_S`: 将`SF`赋值给操作数
+ `CC_L`: 判断`SF`和`OF`是否相等，将结果赋值给`dest`
+ `CC_LE`: 将`ZF`和`SF`是否不等于`OF`的结果取或，然后赋值给`dest`

最后附上完整的`exec`文件

```C
/* 0x80, 0x81, 0x83 */
make_group(gp1,
    EX(add), EX(or), EX(adc), EX(sbb),
    EX(and), EX(sub), EX(xor), EX(cmp))
/* 0xc0, 0xc1, 0xd0, 0xd1, 0xd2, 0xd3 */
make_group(gp2,
    EX(rol), EMPTY, EMPTY, EMPTY,
    EX(shl), EX(shr), EMPTY, EX(sar))
/* 0xf6, 0xf7 */
make_group(gp3,
    IDEX(test_I, test), EMPTY, EX(not), EX(neg),
    EX(mul), EX(imul1), EX(div), EX(idiv))
/* 0xfe */
make_group(gp4,
    EX(inc), EX(dec), EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY)

/* 0xff */
make_group(gp5,
    EXW(inc, 2), EX(dec), EX(call_rm), EX(call),
    EX(jmp_rm), EMPTY, EX(push), EMPTY)

/* 0x0f 0x01*/
make_group(gp7,
    EMPTY, EMPTY, EMPTY, EMPTY,
    EMPTY, EMPTY, EMPTY, EMPTY)

opcode_entry opcode_table [512] = {
  /* 0x00 */  IDEXW(G2E, add, 1), IDEX(G2E, add), IDEXW(E2G, add, 1), IDEX(E2G, add),
  /* 0x04 */  IDEXW(I2a, add, 1), IDEX(I2a, add), EMPTY, EMPTY,
  /* 0x08 */  IDEXW(G2E, or, 1), IDEX(G2E, or), IDEXW(E2G, or, 1), IDEX(E2G, or),
  /* 0x0c */  IDEXW(I2a, or, 1), IDEX(I2a, or), EMPTY, EX(2byte_esc),
  /* 0x10 */  IDEXW(G2E, adc, 1), IDEX(G2E, adc), IDEXW(E2G, adc, 1), IDEX(E2G, adc),
  /* 0x14 */  IDEXW(I2a, adc, 1), IDEX(I2a, adc), EMPTY, EMPTY,
  /* 0x18 */  IDEXW(G2E, sbb, 1), IDEX(G2E, sbb), IDEXW(E2G, sbb, 1), IDEX(E2G, sbb),
  /* 0x1c */  IDEXW(I2a, sbb, 1), IDEX(I2a, sbb), EMPTY, EMPTY,
  /* 0x20 */  IDEXW(G2E, and, 1), IDEX(G2E, and), IDEXW(E2G, and, 1), IDEX(E2G, and),
  /* 0x24 */  IDEXW(I2a, and, 1), IDEX(I2a, and), EMPTY, EMPTY,
  /* 0x28 */  IDEXW(G2E, sub, 1), IDEX(G2E, sub), IDEXW(E2G, sub, 1), IDEX(E2G, sub),
  /* 0x2c */  IDEXW(I2a, sub, 1), IDEX(I2a, sub), EMPTY, EMPTY,
  /* 0x30 */  IDEX(G2E, xor), IDEX(G2E, xor), IDEX(E2G, xor), IDEX(E2G, xor),
  /* 0x34 */  IDEX(I2a, xor), IDEX(I2r, xor), EMPTY, EMPTY,
  /* 0x38 */  IDEXW(G2E, cmp, 1), IDEX(G2E, cmp), IDEXW(E2G, cmp, 1), IDEX(E2G, cmp),
  /* 0x3c */  IDEXW(I2a, cmp, 1), IDEX(I2a, cmp), EMPTY, EMPTY,
  /* 0x40 */  IDEX(r, inc), IDEX(r, inc), IDEX(r, inc), IDEX(r, inc),
  /* 0x44 */  IDEX(r, inc), IDEX(r, inc), IDEX(r, inc), IDEX(r, inc),
  /* 0x48 */  IDEX(r, dec), IDEX(r, dec), IDEX(r, dec), IDEX(r, dec),
  /* 0x4c */  IDEX(r, dec), IDEX(r, dec), IDEX(r, dec), IDEX(r, dec),
  /* 0x50 */  IDEX(r, push), IDEX(r, push), IDEX(r, push), IDEX(r, push),
  /* 0x54 */  IDEX(r, push), IDEX(r, push), IDEX(r, push), IDEX(r, push),
  /* 0x58 */  IDEX(r, pop), IDEX(r, pop), IDEX(r, pop), IDEX(r, pop),
  /* 0x5c */  IDEX(r, pop), IDEX(r, pop), IDEX(r, pop), IDEX(r, pop),
  /* 0x60 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x64 */  EMPTY, EMPTY, EX(operand_size), EMPTY,
  /* 0x68 */  IDEX(push_SI, push), EMPTY, IDEXW(push_SI, push, 1), EMPTY,
  /* 0x6c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x70 */  IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1),
  /* 0x74 */  IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1),
  /* 0x78 */  IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1),
  /* 0x7c */  IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1), IDEXW(J, jcc, 1),
  /* 0x80 */  IDEXW(I2E, gp1, 1), IDEX(I2E, gp1), EMPTY, IDEX(SI2E, gp1),
  /* 0x84 */  IDEXW(G2E, test ,1), IDEX(G2E, test), EMPTY, EMPTY,
  /* 0x88 */  IDEXW(mov_G2E, mov, 1), IDEX(mov_G2E, mov), IDEXW(mov_E2G, mov, 1), IDEX(mov_E2G, mov),
  /* 0x8c */  EMPTY, IDEX(lea_M2G, lea), EMPTY, EMPTY,
  /* 0x90 */  EX(nop), EMPTY, EMPTY, EMPTY,
  /* 0x94 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x98 */  EX(cwtl), EX(cltd), EMPTY, EMPTY,
  /* 0x9c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xa0 */  IDEXW(O2a, mov, 1), IDEX(O2a, mov), IDEXW(a2O, mov, 1), IDEX(a2O, mov),
  /* 0xa4 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xa8 */  IDEXW(I2a, test, 1), IDEX(I2a, test), EMPTY, EMPTY,
  /* 0xac */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xb0 */  IDEXW(mov_I2r, mov, 1), IDEXW(mov_I2r, mov, 1), IDEXW(mov_I2r, mov, 1), IDEXW(mov_I2r, mov, 1),
  /* 0xb4 */  IDEXW(mov_I2r, mov, 1), IDEXW(mov_I2r, mov, 1), IDEXW(mov_I2r, mov, 1), IDEXW(mov_I2r, mov, 1),
  /* 0xb8 */  IDEX(mov_I2r, mov), IDEX(mov_I2r, mov), IDEX(mov_I2r, mov), IDEX(mov_I2r, mov),
  /* 0xbc */  IDEX(mov_I2r, mov), IDEX(mov_I2r, mov), IDEX(mov_I2r, mov), IDEX(mov_I2r, mov),
  /* 0xc0 */  IDEXW(gp2_Ib2E, gp2, 1), IDEX(gp2_Ib2E, gp2), EMPTY, EX(ret),
  /* 0xc4 */  EMPTY, EMPTY, IDEXW(mov_I2E, mov, 1), IDEX(mov_I2E, mov),
  /* 0xc8 */  EMPTY, EX(leave), EMPTY, EMPTY,
  /* 0xcc */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xd0 */  IDEXW(gp2_1_E, gp2, 1), IDEX(gp2_1_E, gp2), IDEXW(gp2_cl2E, gp2, 1), IDEX(gp2_cl2E, gp2),
  /* 0xd4 */  EMPTY, EMPTY, EX(nemu_trap), EMPTY,
  /* 0xd8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xdc */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xe0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xe4 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xe8 */  IDEX(I, call), IDEX(J, jmp), EMPTY, IDEXW(J, jmp, 1),
  /* 0xec */  IDEXW(in_dx2a, in, 1), IDEX(in_dx2a, in), IDEXW(out_a2dx, out, 1), IDEX(out_a2dx, out),
  /* 0xf0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xf4 */  EMPTY, EMPTY, IDEXW(E, gp3, 1), IDEX(E, gp3),
  /* 0xf8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xfc */  EMPTY, EMPTY, IDEXW(E, gp4, 1), IDEX(E, gp5),

  /*2 byte_opcode_table */

  /* 0x00 */  EMPTY, IDEX(gp7_E, gp7), EMPTY, EMPTY,
  /* 0x04 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x08 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x0c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x10 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x14 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x18 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x1c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x20 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x24 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x28 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x2c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x30 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x34 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x38 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x3c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x40 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x44 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x48 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x4c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x50 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x54 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x58 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x5c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x60 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x64 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x68 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x6c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x70 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x74 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x78 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x7c */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0x80 */  IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc),
  /* 0x84 */  IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc),
  /* 0x88 */  IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc),
  /* 0x8c */  IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc), IDEX(J, jcc),
  /* 0x90 */  IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1),
  /* 0x94 */  IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1),
  /* 0x98 */  IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1),
  /* 0x9c */  IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1), IDEXW(E, setcc, 1),
  /* 0xa0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xa4 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xa8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xac */  EMPTY, EMPTY, EMPTY, IDEX(E2G, imul2),
  /* 0xb0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xb4 */  EMPTY, EMPTY, IDEXW(mov_E2G, movzx, 1), IDEXW(mov_E2G, movzx, 2),
  /* 0xb8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xbc */  EMPTY, EMPTY, IDEXW(mov_E2G, movsx, 1), IDEXW(mov_E2G, movsx, 2),
  /* 0xc0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xc4 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xc8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xcc */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xd0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xd4 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xd8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xdc */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xe0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xe4 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xe8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xec */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xf0 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xf4 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xf8 */  EMPTY, EMPTY, EMPTY, EMPTY,
  /* 0xfc */  EMPTY, EMPTY, EMPTY, EMPTY
};
```
### 基础设置(2)

##### 思考题

> Differential Testing能帮你节省多少时间呢?

能节省我至少10个小时

#### Differential Testing

先在`nemu/include/common.h`中定义`DIFF_TEST`

```C
#define DEBUG
#define DIFF_TEST
```

然后在`nemu/src/monitor/diff-test/diff-test.c`文件中的`difftest_step`函数中

```C
if(cpu.eip != r.eip){
  diff = true;
  printf("eip: nemu: 0x%x qemu: 0x%x \n",cpu.eip,r.eip);
}
for(int i = 0 ; i < 8 ; i++){
  if(reg_l(i) != r.array[i]){
    diff = true;
    printf("%s: nemu: 0x%x qemu: 0x%x \n",regsl[i],reg_l(i),r.array[i]);
  }
}
```

这里对`eip`和八个寄存器进行遍历比较，如果发现值不同则设置`diff = true`停止客户程序运行

#### 一键回归测试

在`nemu`目录执行

```
bash runall.sh
```

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.2-runall.png)

全部样例跑通

##### 思考题

> 你觉得该如何捕捉死循环

对程序设置最大运行时间，如果超过该时间则判断程序进入死循环

## PA2.3 输入输出

##### 思考题

> 如果代码中的地址`0x8049000`最终被映射到一个设备寄存器，去掉`volatile`可能会带来什么问题?

变量如果加了 `volatile` 修饰，则会从内存重新装载内容，而不是直接从寄存器拷贝内容，去掉`volatile`会导致错误发生

#### 实现Hello World

```C
make_EHelper(in) {
  t2 = pio_read(id_src->val, id_src->width);
  operand_write(id_dest, &t2);

  print_asm_template2(in);

#ifdef DIFF_TEST
  diff_test_skip_qemu();
#endif
}

make_EHelper(out) {
  pio_write(id_dest->val, id_dest->width, id_src->val);

  print_asm_template2(out);

#ifdef DIFF_TEST
  diff_test_skip_qemu();
#endif
}
```

`in`与`out`类似，分别调用`pio_read`和`pio_write`函数并传入相应参数即可，这里设置了`is_skip_qemu`标志来跳过`QEMU`检查，完成指令后在`all-instr.h`中定义


```C
make_EHelper(rol);
make_EHelper(out);
```

在`exec.c`中填写`opcode table`

```C
/* 0xec */  IDEXW(in_dx2a, in, 1), IDEX(in_dx2a, in), IDEXW(out_a2dx, out, 1), IDEX(out_a2dx, out),
```

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-hello.png)


#### 时钟

在`nexus-am/am/arch/x86-nemu/src/ioe.c`中

```C
void _ioe_init() {
  boot_time = inl(RTC_PORT);
}

unsigned long _uptime() {
  return inl(RTC_PORT) - boot_time;
}
```

可以看出`inl(RTC_PORT)`获取当前时间，`boot_time`为上一次时间，将两者相减返回即可

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-time.png)


#### 看看NEMU跑多快

**Dhrystone**

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-test1.png)

**Coremark**

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-test2.png)

**Microbench**

`ref`测试

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-test3.png)

`test`测试

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-test-s.png)


#### 键盘

```C
int _read_key() {
  uint32_t key_code = _KEY_NONE;
  if(inb(I8042_STATUS_PORT)){
    key_code = inl(I8042_DATA_PORT);
  }

  return key_code;
}
```

这里先判断端口`I8042_STATUS_PORT`是否开启，若开启则获取当前`keycode`即`inl(I8042_DATA_PORT)`，否则返回`_KEY_NONE`

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-key.png)

##### 思考题

> 如何检测多个键被同时按下？

当检测到一个键被按下的时候，去检测此时其他是否有按键被按下

> 在一些90年代的游戏中，很多渐入渐出的效果都是通过调色板实现的，聪明的你知道其中的玄机么？

将颜色模拟成类似透明的白色盖在其他颜色上面，模拟出渐变的颜色


#### 添加内存映射I/O

在`nemu/src/memory/memory.c`文件中

```C
uint32_t paddr_read(paddr_t addr, int len) {
  int port = is_mmio(addr);
  if(port != -1){
    return mmio_read(addr, len, port);
  }
  return pmem_rw(addr, uint32_t) & (~0u >> ((4 - len) << 3));
}

void paddr_write(paddr_t addr, int len, uint32_t data) {
  int port = is_mmio(addr);
  if(port != -1){
    mmio_write(addr, len, data, port);
  }else{
    memcpy(guest_to_host(addr), &data, len);
  }
}
```

先用`is_mmio`函数判断物理地址是否被映射到`I/O`空间，对于`paddr_read`若返回`-1`则访问`pmem`，否则使用`mmio_read`函数读取`port`位置的内存，对于`paddr_write`，若不返回`-1`则调用`mmio_write`将数据写入`port`位置内存

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-vga.png)


#### 实现IOE(3)

```C
void _draw_rect(const uint32_t *pixels, int x, int y, int w, int h) {
  int i;
  for(i = 0; i < h; i++) {
    memcpy(fb + (y + i) * _screen.width + x, pixels + i * w, w * 4);
  }
}
```

将`pixels`指定的的矩形像素绘制到屏幕中以`(x, y)`和`(x+w, y+h)`两点连线为对角线的矩形区域

![](http://p5sf6v0wz.bkt.clouddn.com/pa2.3-type.png)

#### 必答题

##### 编译与链接

> 去掉`static`，去掉`inline`或去掉两者，然后重新进行编译，你会发现错误，请分别解释为什么会发生这些错误？你有办法证明你的想法么

当函数被声明`static`后，**它只在定义它的源文件内有效，其他源文件无法访问**，所以用来解决不同文件函数重名问题，如果去掉进行编译的话，若不同文件有相同函数名则会报错，**证明**可以将不同文件中的函数名里添加文件名进行区分，若不报错则想法正确

`inline`修饰的函数变为内联函数,同时和`static`类似，只有本地文件可见，允许多个文件内重复定义相同名的函数，错误与`static`类似，可能会报重复定义的错误，**证明**可以将不同文件中的函数名里添加文件名进行区分，若不报错则想法正确

##### 编译与链接

> 在`nemu/include/common.h`中添加`volatile static int dummy;`后重新编译`NEMU`,请问重新编译后的`NEMU`有多少个`dummy`变量的实体，你是如何得到这个结果的

有1个。因为在这里用`volatile`定义了一个`dummy`

> 在上一问题条件下在`nemu/include/debug.h`中添加`volatile static int dummy;`,请问重新编译后的`NEMU`有多少个`dummy`变量的实体，与上题中`dummy`实体数目进行比较，并解释本题的结果

有2个。因为两个文件中都使用了`volatile`进行`dummy`的定义，所以不会发生冲突，为2个。

> 修改添加的代码，为两处`dummy`变量进行初始化`volatile static int dummy = 0;`,然后重新编译`NEMU`,你发现了什么问题？为什么之前没有出现这个问题

会报错。因为当`volatile`修饰的`dummy`被赋予了确定的值之后，两个`dummy`就指向了同一个内存地址，会发生重复定义的错误。

##### 了解Makefile

> 请你描述在`nemu`目录下敲入`make`后，`make`程序如何组织`.c`和`.h`文件，最终生成可执行文件`nemu/build/nemu`(这个问题包含两个方面: `makefile`的工作方式和编译链接的过程)

+ 在当前目录下找名字叫`Makefile`或`makefile`的文件
+ 如果找到，它会找文件中的第一个目标文件，并把这个文件作为最终的目标文件
+ 如果文件不存在，或是文件所依赖的后面的`.o`文件的文件修改时间要比这个文件新，那么，他就会执行后面所定义的命令来生成h这个文件，这个也就是重编译
+ 如果文件所依赖的`.o`文件也存在，那么`make`会在当前文件中找目标为`.o`文件的依赖性，如果找到则再根据那一个规则生成`.o`文件。
+ `.c`文件和`.h`文件存在，于是`make`会生成 `.o` 文件
+ `make`会一层一层去找文件的依赖关系，直到最终编译出第一个目标文件，若是过程中出现了错误，`make`会直接退出并报错，直到最后生成可执行文件`nemu`

![](http://p5sf6v0wz.bkt.clouddn.com/Pa2-3log.png)

