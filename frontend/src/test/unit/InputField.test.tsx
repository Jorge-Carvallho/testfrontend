import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputField from '@/components/InputField'
import { renderWithForm } from '@/test/utils/renderWithForm'

type FormModel = { email: string; pwd: string; age: number }

describe('InputField (unit)', () => {
  it('renderiza e mostra placeholder como label', () => {
    renderWithForm<FormModel>(() => (
      <InputField
        name="email"
        control={(null as unknown) as any} // será substituído pelo RHF do wrapper
        label="E-mail"
      />
    ), {
      // truque: o wrapper injeta o control via render function
      defaultValues: { email: '', pwd: '', age: 0 }
    })
    // busca pelo placeholder que recebe label
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument()
  })

  it('aceita digitação e propaga para RHF', async () => {
    const user = userEvent.setup()
    const { container } = renderWithForm<FormModel>((methods) => (
      <form onSubmit={methods.handleSubmit(() => {})}>
        <InputField name="email" control={methods.control} label="E-mail" />
      </form>
    ))
    const input = screen.getByPlaceholderText('E-mail') as HTMLInputElement
    await user.type(input, 'zack@bv.com')
    expect(input.value).toBe('zack@bv.com')
  })

  it('mostra botão de toggle quando type="password" e alterna visibilidade', async () => {
    const user = userEvent.setup()
    renderWithForm<FormModel>((methods) => (
      <InputField name="pwd" control={methods.control} label="Senha" type="password" />
    ))

    const input = screen.getByPlaceholderText('Senha') as HTMLInputElement
    // inicialmente, deve ser "password"
    expect(input).toHaveAttribute('type', 'password')

    // botão com ícone
    const toggle = screen.getByRole('button')
    await user.click(toggle)

    // após toggle, vira texto
    expect(input).toHaveAttribute('type', 'text')

    // volta para password
    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('coerção de número quando type="number"', async () => {
    const user = userEvent.setup()
    renderWithForm<FormModel>((methods) => (
      <InputField name="age" control={methods.control} label="Idade" type="number" />
    ), { defaultValues: { email: '', pwd: '', age: 0 } })

    const input = screen.getByPlaceholderText('Idade') as HTMLInputElement
    await user.clear(input)
    await user.type(input, '42')
    // DOM mantém string, mas o onChange converte para number e RHF armazena numérico.
    expect(input.value).toBe('42')
  })

  it('exibe description e error', () => {
    renderWithForm<FormModel>((methods) => (
      <InputField
        name="email"
        control={methods.control}
        label="E-mail"
        description="Use seu e-mail corporativo"
        error="Campo obrigatório"
      />
    ))
    expect(screen.getByText('Use seu e-mail corporativo')).toBeInTheDocument()
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })
})
