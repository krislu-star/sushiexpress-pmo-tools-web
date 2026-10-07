import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge } from '../badge';
import { Button } from '../button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../dialog';
import { Input } from '../input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { Switch } from '../switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { Textarea } from '../textarea';

describe('cms UI 元件（複製版）smoke test', () => {
  it('Button：預設 type=button，disabled 時不可點擊', async () => {
    const onClick = jest.fn();
    render(
      <>
        <Button onClick={onClick}>預覽報告</Button>
        <Button disabled onClick={onClick}>
          列印
        </Button>
      </>
    );
    await userEvent.click(screen.getByRole('button', { name: '預覽報告' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '預覽報告' })).toHaveAttribute(
      'type',
      'button'
    );
    expect(screen.getByRole('button', { name: '列印' })).toBeDisabled();
  });

  it('Button：loading 時顯示處理中（不依賴 cms i18n）', () => {
    render(
      <Button variant="third" loading>
        送出
      </Button>
    );
    expect(screen.getByRole('button')).toHaveTextContent('處理中');
  });

  it('Badge、Input、Textarea 可渲染', () => {
    render(
      <>
        <Badge>進行中</Badge>
        <Input aria-label="搜尋" />
        <Textarea aria-label="風險" />
      </>
    );
    expect(screen.getByText('進行中')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '搜尋' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '風險' })).toBeInTheDocument();
  });

  it('Dialog 開啟時渲染到 body 並有標題', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>案件詳細</DialogTitle>
          <DialogDescription>說明</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(
      screen.getByRole('dialog', { name: '案件詳細' })
    ).toBeInTheDocument();
  });

  it('Switch 可切換並回報狀態', async () => {
    const onChange = jest.fn();
    render(<Switch aria-label="納入呈報" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole('switch', { name: '納入呈報' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Select 顯示目前值', () => {
    render(
      <Select value="全部小組">
        <SelectTrigger aria-label="篩選小組">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="全部小組">全部小組</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(
      screen.getByRole('combobox', { name: '篩選小組' })
    ).toHaveTextContent('全部小組');
  });

  it('Tabs 切換內容', async () => {
    render(
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">專案列表</TabsTrigger>
          <TabsTrigger value="cases">工作列表</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">P</TabsContent>
        <TabsContent value="cases">C</TabsContent>
      </Tabs>
    );
    await userEvent.click(screen.getByRole('tab', { name: '工作列表' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('C');
  });

  it('Table 結構正確', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>案件名稱</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>POS優化</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(
      screen.getByRole('columnheader', { name: '案件名稱' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'POS優化' })).toBeInTheDocument();
  });
});
